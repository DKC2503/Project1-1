const mongoose = require('mongoose');

const geoCacheSchema = new mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    lastUpdate: { type: Date, default: Date.now }
});

// Index to automatically expire IP cache after 30 days
geoCacheSchema.index({ lastUpdate: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('GeoCache', geoCacheSchema);
