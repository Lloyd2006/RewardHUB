const { db } = require('../services/firebase');

// Get all rewards
exports.getRewards = async (req, res) => {
  try {
    const rewardsSnapshot = await db.collection('rewards').get();
    const rewards = rewardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).send('Internal Server Error');
  }
};
