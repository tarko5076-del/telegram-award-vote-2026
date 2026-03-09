// backend/routes/nominees.js - PostgreSQL version (pg library)
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/nominees - grouped by category for frontend
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM nominees ORDER BY category, name');
    const rows = result.rows;  // pg returns { rows: [...] }

    // Group by category
    const grouped = rows.reduce((acc, nom) => {
      if (!acc[nom.category]) acc[nom.category] = [];
      acc[nom.category].push(nom);
      return acc;
    }, {});

    const formatted = Object.entries(grouped).map(([title, nominees]) => ({
      title,
      nominees
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching grouped nominees:', err.message);
    console.error('Full error:', err);
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

module.exports = router;