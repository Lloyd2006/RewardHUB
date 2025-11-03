const { db } = require('../services/firebase');

// Get a summary of analytics data
exports.getSummary = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const transactionsSnapshot = await db.collection('transactions').get();

    const totalUsers = usersSnapshot.size;
    let totalPointsInCirculation = 0;
    usersSnapshot.forEach(doc => {
      totalPointsInCirculation += doc.data().points;
    });

    const totalTransactions = transactionsSnapshot.size;

    res.status(200).json({
      totalUsers,
      totalPointsInCirculation,
      totalTransactions,
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).send('Internal Server Error');
  }
};
