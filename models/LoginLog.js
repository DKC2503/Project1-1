const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    email: { type: String, required: true },
    role: { type: String },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date },
    sessionDuration: { type: Number }, // in minutes
    ipAddress: { type: String },
    browser: { type: String },
    operatingSystem: { type: String },
    deviceType: { type: String },
    status: { type: String, enum: ['success', 'failed'], required: true },
    userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LoginLog', loginLogSchema);
