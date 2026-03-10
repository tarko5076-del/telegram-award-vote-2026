// backend/routes/votes.js
const express = require('express');
const router = express.Router();
const { vote } = require('../controllers/voteController');

// POST /api/votes/vote
router.post('/vote', vote);

module.exports = router;
