const { admin, db } = require('../services/firebase');

const adminAuth = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;

    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).send('Forbidden: You do not have admin privileges.');
    }

    next();
  } catch (error) {
    console.error('Error while verifying admin token:', error);
    res.status(401).send('Unauthorized');
  }
};

module.exports = adminAuth;
