const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, analyticsController.getDashboardData);
router.get('/metrics', auth, analyticsController.getMetrics);
router.get('/performance', auth, analyticsController.getPerformance);

module.exports = router;