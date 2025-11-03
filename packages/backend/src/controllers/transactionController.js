const { admin, db } = require('../services/firebase');

// Award points to a user
exports.earnPoints = async (req, res) => {
  try {
    const { userId, points } = req.body;

    if (!userId || typeof points !== 'number') {
      return res.status(400).json({ error: 'Invalid request body. Please provide a valid userId and points.' });
    }

    // 1. Create a transaction document
    const transactionRef = await db.collection('transactions').add({
      userId: userId,
      type: 'EARNED',
      points: points,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Update user's points balance
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      points: admin.firestore.FieldValue.increment(points)
    });

    res.status(200).json({ 
      message: 'Points awarded successfully', 
      transactionId: transactionRef.id 
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Redeem a reward for a user
exports.redeemReward = async (req, res) => {
  try {
    const { userId, rewardId } = req.body;

    if (!userId || !rewardId) {
        return res.status(400).json({ error: 'Invalid request body. Please provide a valid userId and rewardId.' });
    }

    const userRef = db.collection('users').doc(userId);
    const rewardRef = db.collection('rewards').doc(rewardId);

    const userDoc = await userRef.get();
    const rewardDoc = await rewardRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    if (!rewardDoc.exists) {
      return res.status(404).send('Reward not found');
    }

    const userPoints = userDoc.data().points;
    const rewardCost = rewardDoc.data().points_cost;

    if (userPoints < rewardCost) {
      return res.status(400).send('Insufficient points');
    }

    // 1. Create a transaction document
    const transactionRef = await db.collection('transactions').add({
      userId: userId,
      rewardId: rewardId,
      type: 'REDEEMED',
      points: rewardCost,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Update user's points balance
    await userRef.update({
      points: admin.firestore.FieldValue.increment(-rewardCost)
    });

    res.status(200).json({ 
      message: 'Reward redeemed successfully', 
      transactionId: transactionRef.id 
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).send('Internal Server Error');
  }
};
