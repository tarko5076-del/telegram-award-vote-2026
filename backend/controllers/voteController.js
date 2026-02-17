// backend/controllers/voteController.js
const { hasVoted, addVoter } = require('../models/voterModel');
const { getAllNominees, incrementVote } = require('../models/nomineeModel');

const vote = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const { nominee_id, category } = req.body;

  if (!nominee_id || !category) {
    return res.status(400).json({ error: 'nominee_id and category are required' });
  }

  try {
    // Check if this IP already voted in this category
    if (await hasVoted(ip, category)) {
      return res.status(403).json({ error: 'You have already voted in this category' });
    }

    // Record the vote
    await addVoter(ip, category, nominee_id);
    await incrementVote(nominee_id);

    // Return updated data
    const updatedNominees = await getAllNominees();
    
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      nominees: updatedNominees
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { vote };