const mongoose = require('mongoose');

const creditRuleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    key: { type: String, required: true, unique: true }, // e.g., AUTHOR_ARTICLE_PUBLISH
    role: { type: String, required: true },
    credits: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CreditRule', creditRuleSchema);
