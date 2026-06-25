const mongoose = require('mongoose');

const systemSettingsHistorySchema = new mongoose.Schema({
    settings: { type: mongoose.Schema.Types.Mixed },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    version: { type: Number }
});

module.exports = mongoose.model('SystemSettingsHistory', systemSettingsHistorySchema);
