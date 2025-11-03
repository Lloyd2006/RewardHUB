const { admin, db } = require('../services/firebase');

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  const idToken = header.split('Bearer ')[1];

  try {
    // Verify the token using the Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    req.user = {
      ...decodedToken,
      ...userDoc.data()
    };

    next(); // If token is valid, proceed to the next function
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized: Invalid token');
  }
}

module.exports = authMiddleware;
