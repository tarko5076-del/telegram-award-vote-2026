const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/auth/login - simple plain password check
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Success - simple response (later we can add token)
    res.json({ 
      success: true, 
      message: 'Login successful',
      admin: { id: rows[0].id, username: rows[0].username }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;