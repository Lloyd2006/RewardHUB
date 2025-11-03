const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/summary
router.get('/summary', analyticsController.getSummary);

module.exports = router;
