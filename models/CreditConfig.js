const mongoose = require('mongoose');

const creditConfigSchema = new mongoose.Schema({
    maxContentCredits: { type: Number, default: 40 },
    maxResearchCredits: { type: Number, default: 30 },
    maxSeoCredits: { type: Number, default: 10 },
    maxHeadlineCredits: { type: Number, default: 10 },
    maxImageCredits: { type: Number, default: 10 },
    maxPublishingCredits: { type: Number, default: 10 },
    defaultPublishingCredits: { type: Number, default: 5 },
    maxTotalCredits: { type: Number, default: 120 }
}, {
    timestamps: true
});

module.exports = mongoose.model('CreditConfig', creditConfigSchema);
