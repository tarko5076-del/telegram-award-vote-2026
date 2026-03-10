// backend/models/voterModel.js
const pool = require('../config/db');

// Check if a voter (by IP) has already voted in a category
const hasVoted = async (ip, category) => {
  try {
    const result = await pool.query(
      'SELECT 1 FROM votes WHERE voter_ip = $1 AND category = $2 LIMIT 1',
      [ip, category]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error('hasVoted query error:', err.message);
    throw err;
  }
};

// Record a new vote in the votes table
const recordVote = async (ip, nominee_id, category) => {
  try {
    await pool.query(
      'INSERT INTO votes (voter_ip, nominee_id, category) VALUES ($1, $2, $3)',
      [ip, nominee_id, category]
    );
  } catch (err) {
    console.error('recordVote insert error:', err.message);
    throw err;
  }
};

// Get nominees with live vote counts (joined with votes table)
const getUpdatedNominees = async () => {
  try {
    const result = await pool.query(`
      SELECT n.id, n.category, n.name, n.image_url,
             COALESCE(COUNT(v.id), 0) AS votes
      FROM nominees n
      LEFT JOIN votes v ON v.nominee_id = n.id
      GROUP BY n.id, n.category, n.name, n.image_url
      ORDER BY n.category, n.name
    `);
    return result.rows;
  } catch (err) {
    console.error('getUpdatedNominees error:', err.message);
    throw err;
  }
};

module.exports = {
  hasVoted,
  recordVote,
  getUpdatedNominees
};
