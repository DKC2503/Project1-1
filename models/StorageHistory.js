const mongoose = require('mongoose');

const storageHistorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    adminName: { type: String, required: true },
    oldCloudName: { type: String, default: 'Default (.env)' },
    newCloudName: { type: String, required: true },
    reason: { type: String, default: '' }
});

module.exports = mongoose.model('StorageHistory', storageHistorySchema);
