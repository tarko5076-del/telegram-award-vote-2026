// backend/routes/nominees.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/nominees - grouped by category with live vote counts + percentages
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.id, n.category, n.name, n.image_url,
             COALESCE(COUNT(v.id), 0) AS votes
      FROM nominees n
      LEFT JOIN votes v ON v.nominee_id = n.id
      GROUP BY n.id, n.category, n.name, n.image_url
      ORDER BY n.category, n.name
    `);

    const grouped = result.rows.reduce((acc, nom) => {
      if (!acc[nom.category]) acc[nom.category] = [];
      acc[nom.category].push(nom);
      return acc;
    }, {});

    const formatted = Object.entries(grouped).map(([title, nominees]) => {
      const totalVotes = nominees.reduce((sum, n) => sum + Number(n.votes), 0);
      const withPercentages = nominees.map(n => ({
        ...n,
        percentage: totalVotes > 0 ? (n.votes / totalVotes * 100).toFixed(2) : "0.00"
      }));
      return { title, nominees: withPercentages };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching grouped nominees:', err.message);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

// GET /api/nominees/all - raw list (for admin)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, category, name, image_url FROM nominees ORDER BY category, name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching all nominees:', err.message);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

// POST /api/nominees/add - add new nominee
router.post('/add', async (req, res) => {
  const { category, name, image_url } = req.body;

  if (!category || !name) {
    return res.status(400).json({ error: 'category and name are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO nominees (category, name, image_url) VALUES ($1, $2, $3) RETURNING id',
      [category, name, image_url || null]
    );

    res.status(201).json({
      success: true,
      message: 'Nominee added successfully',
      id: result.rows[0].id
    });
  } catch (err) {
    console.error('Error adding nominee:', err.message);
    res.status(500).json({ error: 'Failed to add nominee' });
  }
});

// DELETE /api/nominees/delete/:id - delete nominee
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM nominees WHERE id = $1', [id]);
    res.json({ success: true, message: 'Nominee deleted successfully' });
  } catch (err) {
    console.error('Error deleting nominee:', err.message);
    res.status(500).json({ error: 'Failed to delete nominee' });
  }
});

// PUT /api/nominees/update/:id - update nominee
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { category, name, image_url } = req.body;

  if (!category || !name) {
    return res.status(400).json({ error: 'category and name are required' });
  }

  try {
    await pool.query(
      'UPDATE nominees SET category = $1, name = $2, image_url = $3 WHERE id = $4',
      [category, name, image_url || null, id]
    );
    res.json({ success: true, message: 'Nominee updated successfully' });
  } catch (err) {
    console.error('Error updating nominee:', err.message);
    res.status(500).json({ error: 'Failed to update nominee' });
  }
});

module.exports = router;
