// backend/models/nomineeModel.js
const pool = require('../config/db');

const getAllNominees = async () => {
  const [rows] = await pool.query(`
    SELECT id, category, name, image_url AS image, votes 
    FROM nominees 
    ORDER BY category ASC, votes DESC
  `);
  return rows;
};

const incrementVote = async (nomineeId) => {
  await pool.query('UPDATE nominees SET votes = votes + 1 WHERE id = ?', [nomineeId]);
};

module.exports = { getAllNominees, incrementVote };