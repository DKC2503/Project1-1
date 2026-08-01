const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    views: { type: Number, default: 0 }, // Article Opens / Refreshes
    uniqueVisitors: { type: Number, default: 0 }, // Unique Views
    revisits: { type: Number, default: 0 }, // Revisits
    shares: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
