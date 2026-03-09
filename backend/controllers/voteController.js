// controllers/voteController.js - PostgreSQL direct version (no model layer)
const pool = require('../config/db');

const vote = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const { nominee_id, category } = req.body;

  if (!nominee_id || !category) {
    return res.status(400).json({ error: 'nominee_id and category are required' });
  }

  try {
    // 1. Check if this IP already voted in this category
    const checkVote = await pool.query(
      'SELECT 1 FROM votes WHERE voter_ip = $1 AND category = $2',
      [ip, category]
    );

    if (checkVote.rows.length > 0) {
      return res.status(403).json({ error: 'You have already voted in this category' });
    }

    // 2. Record the vote
    const insertVote = await pool.query(
      'INSERT INTO votes (voter_ip, nominee_id, category) VALUES ($1, $2, $3) RETURNING id',
      [ip, nominee_id, category]
    );

    // 3. Increment vote count on nominee (optional if you use COUNT in GET)
    await pool.query(
      'UPDATE nominees SET votes = votes + 1 WHERE id = $1',
      [nominee_id]
    );

    // 4. Get updated nominees for frontend refresh
    const updated = await pool.query(`
      SELECT n.id, n.category, n.name, n.image_url, COALESCE(COUNT(v.id), 0) AS votes
      FROM nominees n
      LEFT JOIN votes v ON v.nominee_id = n.id
      GROUP BY n.id, n.category, n.name, n.image_url
      ORDER BY n.category, n.name
    `);

    const rows = updated.rows;
    const grouped = rows.reduce((acc, nom) => {
      if (!acc[nom.category]) acc[nom.category] = [];
      acc[nom.category].push(nom);
      return acc;
    }, {});

    const formatted = Object.entries(grouped).map(([title, nominees]) => ({
      title,
      nominees
    }));

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      nominees: formatted
    });
  } catch (err) {
    console.error('Vote controller error:', err.message, err.stack);
    res.status(500).json({ error: 'Server error - vote not recorded' });
  }
};

module.exports = { vote };