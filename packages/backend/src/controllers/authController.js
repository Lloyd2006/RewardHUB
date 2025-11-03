const { admin, db } = require('../services/firebase');
const axios = require('axios');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    // 2. Create user document in Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    await userDocRef.set({
      email: email,
      points: 0,
      qr_code: userRecord.uid, // Using uid as the QR code content
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: userRecord.uid,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const apiKey = process.env.FIREBASE_WEB_API_KEY; // Make sure to set this environment variable

    if (!apiKey) {
      throw new Error('Firebase Web API Key is not defined. Please set the FIREBASE_WEB_API_KEY environment variable.');
    }

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      }
    );

    res.status(200).json({
      message: 'User logged in successfully',
      idToken: response.data.idToken,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn,
      localId: response.data.localId,
    });
  } catch (error) {
    console.error('Error logging in user:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ error: error.response ? error.response.data.error.message : 'Internal Server Error' });
  }
};

// Handle Google and Apple Sign-In
exports.socialLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    // 1. Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    // 2. Check if user exists in Firestore
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // 3. If user doesn't exist, create a new user document
      await userDocRef.set({
        email: email,
        points: 0,
        qr_code: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // 4. The ID token can be used by the client for subsequent requests
    res.status(200).json({
      message: 'User logged in successfully with social provider',
      idToken: idToken,
      userId: uid,
    });
  } catch (error) {
    console.error('Error with social login:', error);
    res.status(401).json({ error: 'Invalid ID token' });
  }
};
