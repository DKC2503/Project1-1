const mongoose = require('mongoose');

const analyticsSummarySchema = new mongoose.Schema({
    date: { type: Date, required: true, unique: true }, // Format: YYYY-MM-DD
    totalViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    returningVisitors: { type: Number, default: 0 },
    topArticles: [{
        articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
        title: { type: String },
        views: { type: Number }
    }],
    topCategories: [{
        category: { type: String },
        views: { type: Number }
    }],
    topSearches: [{
        query: { type: String },
        count: { type: Number }
    }],
    hourlyTraffic: { type: Map, of: Number }, // hour (0-23) -> views
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnalyticsSummaryV1', analyticsSummarySchema);
