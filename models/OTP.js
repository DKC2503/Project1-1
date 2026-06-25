const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Auto-delete after expiry (using TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Remove the "next" argument to avoid TypeError: next is not a function in recent Mongoose versions
otpSchema.pre('save', async function() {
    if (this.isModified('otp')) {
        this.otp = await bcrypt.hash(this.otp, 10);
    }
});

otpSchema.methods.compareOTP = async function(candidateOTP) {
    return await bcrypt.compare(candidateOTP, this.otp);
};

module.exports = mongoose.model('OTP', otpSchema);
