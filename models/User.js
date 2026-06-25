const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, enum: ['super_admin', 'admin', 'editor', 'reviewer', 'author', 'tech'], default: 'author' },
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    invitedBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: null },

    // Performance Credit System
    totalCredits: { type: Number, default: 0 },
    monthlyCredits: { type: Number, default: 0 },
    yearlyCredits: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null },
    badges: [{ type: String }],
    achievements: [{ type: String }]
});

userSchema.index({ role: 1 });
userSchema.index({ totalCredits: -1 });
userSchema.index({ monthlyCredits: -1 });

module.exports = mongoose.model('User', userSchema);
