const { db } = require('../services/firebase');

// Get the profile of the currently logged-in user
exports.getUserProfile = async (req, res) => {
  try {
    // The user's ID comes from the authMiddleware we created
    const userId = req.user.uid;

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Internal Server Error");
  }
};
