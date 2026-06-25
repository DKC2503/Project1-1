const mongoose = require('mongoose');

const flashNewsSchema = new mongoose.Schema({
    headline: { type: String, required: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FlashNews', flashNewsSchema);
