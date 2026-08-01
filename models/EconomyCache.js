const mongoose = require('mongoose');

const economyCacheSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // 'metals', 'fuel', 'rates'
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    lastUpdate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EconomyCache', economyCacheSchema);
