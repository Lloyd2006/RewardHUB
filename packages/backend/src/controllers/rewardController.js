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

// Create a new reward
exports.createReward = async (req, res) => {
  try {
    const { name, description, points_cost, is_active } = req.body;

    if (!name || typeof points_cost !== 'number') {
      return res.status(400).json({ error: 'Invalid request body. Please provide a valid name and points_cost.' });
    }

    const newRewardRef = await db.collection('rewards').add({
      name,
      description,
      points_cost,
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({
      message: 'Reward created successfully',
      rewardId: newRewardRef.id,
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Update an existing reward
exports.updateReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const { name, description, points_cost, is_active } = req.body;

    if (!rewardId) {
      return res.status(400).json({ error: 'Reward ID is required.' });
    }

    const rewardRef = db.collection('rewards').doc(rewardId);
    const rewardDoc = await rewardRef.get();

    if (!rewardDoc.exists) {
      return res.status(404).send('Reward not found');
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (points_cost !== undefined) updateData.points_cost = points_cost;
    if (is_active !== undefined) updateData.is_active = is_active;

    await rewardRef.update(updateData);

    res.status(200).json({ message: 'Reward updated successfully' });
  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Delete a reward
exports.deleteReward = async (req, res) => {
  try {
    const { rewardId } = req.params;

    if (!rewardId) {
      return res.status(400).json({ error: 'Reward ID is required.' });
    }

    const rewardRef = db.collection('rewards').doc(rewardId);
    const rewardDoc = await rewardRef.get();

    if (!rewardDoc.exists) {
      return res.status(404).send('Reward not found');
    }

    await rewardRef.delete();

    res.status(200).json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).send('Internal Server Error');
  }
};
