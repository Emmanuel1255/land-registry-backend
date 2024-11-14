// src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard');

router.get('/stats', auth, dashboardController.getDashboardStats);
router.get('/trends', auth, dashboardController.getRegistrationTrends);
router.get('/activities', auth, dashboardController.getRecentActivities);

module.exports = router;