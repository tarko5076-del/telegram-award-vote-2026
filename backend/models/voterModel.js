// backend/models/voterModel.js - PostgreSQL version (no MySQL syntax)
const pool = require('../config/db');

const hasVoted = async (ip, category) => {
  const result = await pool.query(
    'SELECT id FROM voters WHERE ip_address = $1 AND category = $2',
    [ip, category]
  );
  return result.rows.length > 0;
};

const addVoter = async (ip, category, nomineeId) => {
  await pool.query(
    'INSERT INTO voters (ip_address, category, nominee_id) VALUES ($1, $2, $3)',
    [ip, category, nomineeId]
  );
};

module.exports = { hasVoted, addVoter };