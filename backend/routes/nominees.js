// backend/routes/nominees.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/nominees - grouped for frontend (your original code)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM nominees ORDER BY category, name');

    // Group by category (your existing logic)
    const grouped = rows.reduce((acc, nom) => {
      if (!acc[nom.category]) acc[nom.category] = [];
      acc[nom.category].push(nom);
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([title, nominees]) => ({
      title,
      
      nominees
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching grouped nominees:', err);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

// GET /api/nominees/all - raw list for admin dashboard
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, category, name, image_url, votes FROM nominees ORDER BY category, name');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all nominees:', err);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

// POST /api/nominees/add - add new nominee from admin
router.post('/add', async (req, res) => {
  const { category, name, image_url } = req.body;

  if (!category || !name) {
    return res.status(400).json({ error: 'category and name are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO nominees (category, name, image_url, votes) VALUES (?, ?, ?, 0)',
      [category, name, image_url || null]
    );

    res.status(201).json({
      success: true,
      message: 'Nominee added successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error adding nominee:', err);
    res.status(500).json({ error: 'Failed to add nominee' });
  }
});

module.exports = router;