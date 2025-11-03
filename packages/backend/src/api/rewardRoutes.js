const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

// GET /api/rewards (Public)
router.get('/', auth, rewardController.getRewards);

// POST /api/rewards (Admin only)
router.post('/', adminAuth, rewardController.createReward);

// PUT /api/rewards/:rewardId (Admin only)
router.put('/:rewardId', adminAuth, rewardController.updateReward);

// DELETE /api/rewards/:rewardId (Admin only)
router.delete('/:rewardId', adminAuth, rewardController.deleteReward);

module.exports = router;
