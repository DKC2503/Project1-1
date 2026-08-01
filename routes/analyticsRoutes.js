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

// Download monthly performance report
router.get('/report', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { format } = req.query;
        const report = await analyticsService.generateMonthlyReport(format);
        
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).substring(2);
        
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=NP_${mm}_${yy}.csv`);
            res.send(report);
        } else {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=NP_${mm}_${yy}.xlsx`);
            res.send(report);
        }
    } catch (err) {
        console.error('[Analytics Routes] Report Error:', err);
        res.status(500).json({ error: 'Failed to generate report.' });
    }
});

module.exports = router;
