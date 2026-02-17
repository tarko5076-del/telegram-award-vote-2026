// backend/models/voterModel.js
const pool = require('../config/db');

const hasVoted = async (ip, category) => {
  const [rows] = await pool.query(
    'SELECT id FROM voters WHERE ip_address = ? AND category = ?',
    [ip, category]
  );
  return rows.length > 0;
};

const addVoter = async (ip, category, nomineeId) => {
  await pool.query(
    'INSERT INTO voters (ip_address, category, nominee_id) VALUES (?, ?, ?)',
    [ip, category, nomineeId]
  );
};

module.exports = { hasVoted, addVoter };