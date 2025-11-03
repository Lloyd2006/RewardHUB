const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');

// GET /api/rewards
router.get('/', rewardController.getRewards);

module.exports = router;
