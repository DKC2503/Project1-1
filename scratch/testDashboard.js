require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/Article');
const AnalyticsLogV1 = require('../models/AnalyticsLogV1');
const VisitorV1 = require('../models/VisitorV1');
const analyticsService = require('../services/analyticsService');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newspercent');
        
        // Find an article
        const article = await Article.findOne();
        if (!article) {
            console.log('No articles found');
            return;
        }

        console.log(`Using article ${article._id}`);

        // Insert a Visitor
        const visitorId = 'mock-visitor-123';
        await VisitorV1.updateOne(
            { visitorId }, 
            { visitorId, isReturning: true, lastVisit: new Date() },
            { upsert: true }
        );

        // Track a view via the service
        await analyticsService.trackEvent({
            visitorId,
            type: 'PAGE_VIEW',
            articleId: article._id,
            category: article.category,
            path: `/article/${article._id}`,
            referrer: ''
        });

        console.log('Tracked event successfully');

        // Check Admin Dashboard
        const dashboard = await analyticsService.getDashboardData('7d');
        console.log('Admin Growth Chart:', dashboard.traffic.growthChart);
        console.log('Admin Top Articles:', dashboard.content.topArticles);

        // Check Author Performance Aggregation manually (similar to server.js)
        const authorId = article.authorId;
        const articles = await Article.find({ authorId });
        const authorChart = await AnalyticsLogV1.aggregate([
            { $match: { 
                articleId: { $in: articles.map(a => a._id) },
                type: 'PAGE_VIEW'
            }},
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                views: { $sum: 1 }
            }},
            { $sort: { _id: 1 } },
            { $project: { date: "$_id", views: 1, _id: 0 } }
        ]);

        console.log('Author Growth Chart:', authorChart);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}
test();
