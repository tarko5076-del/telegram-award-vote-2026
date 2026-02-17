// backend/routes/nominees.js
const express = require('express');
const router = express.Router();
const { getNominees } = require('../controllers/nomineeController');

router.get('/', getNominees);

module.exports = router;