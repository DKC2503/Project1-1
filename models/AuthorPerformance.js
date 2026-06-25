const mongoose = require('mongoose');

const authorPerformanceSchema = new mongoose.Schema({
    authorId: { type: String, required: true, unique: true },
    totalCredits: { type: Number, default: 0 },
    totalArticles: { type: Number, default: 0 },
    premiumArticles: { type: Number, default: 0 },
    breakingNewsCount: { type: Number, default: 0 },
    seoBonusCount: { type: Number, default: 0 },
    consistencyBonusCount: { type: Number, default: 0 },
    teamworkBonusCount: { type: Number, default: 0 },
    innovationBonusCount: { type: Number, default: 0 },
    deductionsCount: { type: Number, default: 0 },
    rank: { type: String, default: 'Junior' },
    lastActivityDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuthorPerformance', authorPerformanceSchema);
