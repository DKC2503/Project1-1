const mongoose = require('mongoose');

const externalApiConfigSchema = new mongoose.Schema({
    serviceName: { 
        type: String, 
        required: true, 
        enum: ['Weather API', 'Stock Market API'] 
    },
    provider: { type: String, required: true },
    apiKey: { type: String }, // Encrypted
    status: { 
        type: String, 
        required: true, 
        enum: ['ACTIVE', 'RETIRED', 'FAILED'],
        default: 'ACTIVE' 
    },
    enabled: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now, required: true },
    endDate: { type: Date },
    reason: { type: String, default: '' },
    lastTested: { type: Date },
    lastHttpStatus: { type: Number },
    lastResponseMsg: { type: String },
    updatedBy: { type: String, required: true }, // Admin's Name
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExternalApiConfig', externalApiConfigSchema);
