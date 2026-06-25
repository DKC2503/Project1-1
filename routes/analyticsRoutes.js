const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public tracking endpoint
router.post('/track', async (req, res) => {
    try {
        const result = await analyticsService.trackEvent(req.body);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error('[Analytics Routes] Track Error:', err);
        res.status(500).json({ success: false });
    }
});

// Admin Dashboard Summary
router.get('/dashboard', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { period } = req.query;
        const stats = await analyticsService.getDashboardData(period);
        res.json(stats);
    } catch (err) {
        console.error('[Analytics Routes] Dashboard Error:', err);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

// Manual Archive Trigger
router.post('/archive', verifyToken, requireAdmin, async (req, res) => {
    try {
        const result = await analyticsService.archiveMonthlyData();
        res.json(result);
    } catch (err) {
        console.error('[Analytics Routes] Archive Error:', err);
        res.status(500).json({ message: 'Error archiving data' });
    }
});

module.exports = router;
