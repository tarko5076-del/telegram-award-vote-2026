// backend/routes/auth.js
const express = require('express');
const router = express.Router();

// Very simple hardcoded login (replace with real auth later)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'tarko' && password === 'yourpassword') {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
