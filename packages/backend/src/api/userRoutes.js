const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Apply the auth middleware to this route
// GET /api/users/me
router.get('/me', authMiddleware, userController.getUserProfile);

module.exports = router;
