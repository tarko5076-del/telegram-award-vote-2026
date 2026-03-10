// backend/controllers/voteController.js
const {
  hasVoted,
  recordVote,
  getUpdatedNominees
} = require('../models/voterModel');

const vote = async (req, res) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.connection.remoteAddress ||
    'unknown';

  const { nominee_id, category } = req.body;

  if (!nominee_id || !category) {
    return res.status(400).json({ error: 'nominee_id and category are required' });
  }

  try {
    // Prevent duplicate vote per IP per category
    if (await hasVoted(ip, category)) {
      return res.status(403).json({ error: 'You have already voted in this category' });
    }

    // Record vote in votes table
    await recordVote(ip, nominee_id, category);

    // Get fresh grouped data for frontend refresh
    const rows = await getUpdatedNominees();

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
    console.error('voteController error:', {
      message: err.message,
      ip,
      nominee_id,
      category
    });

    res.status(500).json({
      error: 'Server error - vote not recorded',
      debug: err.message   // remove in production
    });
  }
};

module.exports = { vote };
