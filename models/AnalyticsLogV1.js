const mongoose = require('mongoose');

const analyticsLogSchema = new mongoose.Schema({
    visitorId: { type: String, required: true },
    type: { type: String, enum: ['PAGE_VIEW', 'SEARCH', 'INTERACTION'], required: true },
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    category: { type: String },
    searchQuery: { type: String },
    readingTime: { type: Number, default: 0 }, // in seconds
    scrollDepth: { type: Number, default: 0 }, // percentage
    completed: { type: Boolean, default: false }, // scrollDepth > 90%
    path: { type: String },
    referrer: { type: String },
    timestamp: { type: Date, default: Date.now }
});

analyticsLogSchema.index({ timestamp: -1 });
analyticsLogSchema.index({ type: 1, timestamp: -1 });
analyticsLogSchema.index({ visitorId: 1, timestamp: -1 });

module.exports = mongoose.model('AnalyticsLogV1', analyticsLogSchema);
