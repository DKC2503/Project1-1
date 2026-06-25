const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    visitorId: { type: String, required: true, unique: true }, // Fingerprint/UUID from frontend
    firstVisit: { type: Date, default: Date.now },
    lastVisit: { type: Date, default: Date.now },
    ipHash: { type: String }, // Optional, for extra security
    isReturning: { type: Boolean, default: false }
});

module.exports = mongoose.model('VisitorV1', visitorSchema);
