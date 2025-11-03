const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// POST /api/transactions/earn
router.post('/earn', transactionController.earnPoints);

// POST /api/transactions/redeem
router.post('/redeem', transactionController.redeemReward);

module.exports = router;
