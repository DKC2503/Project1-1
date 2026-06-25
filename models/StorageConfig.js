const mongoose = require('mongoose');

const storageConfigSchema = new mongoose.Schema({
    cloudName: { type: String, required: true },
    apiKey: { type: String, required: true },
    apiSecret: { type: String, required: true }, // Encrypted
    folderPrefix: { type: String, default: 'newspercent' },
    purpose: { 
        type: String, 
        required: true, 
        enum: ['Profile Images', 'Article Content Images', 'profile', 'article'] 
    },
    status: { 
        type: String, 
        required: true, 
        enum: ['ACTIVE', 'RETIRED', 'FAILED'],
        default: 'ACTIVE' 
    },
    startDate: { type: Date, default: Date.now, required: true },
    endDate: { type: Date },
    reason: { type: String, default: '' },
    updatedBy: { type: String, required: true }, // Admin's Name
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StorageConfig', storageConfigSchema);
