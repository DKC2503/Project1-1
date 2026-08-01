const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    // Global Switches
    performanceCreditsEnabled: { type: Boolean, default: true },
    documentExportEnabled: { type: Boolean, default: true },
    weatherApiEnabled: { type: Boolean, default: true },
    marketApiEnabled: { type: Boolean, default: true },
    populationApiEnabled: { type: Boolean, default: true },
    emailServiceEnabled: { type: Boolean, default: true },
    preciousMetalsApiEnabled: { type: Boolean, default: true },
    fuelApiEnabled: { type: Boolean, default: true },
    emergencyMode: { type: Boolean, default: false },
    
    // Legacy mapping (kept for safety/compatibility)
    creditSystemEnabled: { type: Boolean, default: true },
    exportSystemEnabled: { type: Boolean, default: true },
    externalApisEnabled: { type: Boolean, default: true },
    analyticsEnabled: { type: Boolean, default: true },

    // Credit Configuration
    credits: {
        // Author Base
        AUTHOR_ARTICLE_PUBLISH: { type: Number, default: 10 },
        AUTHOR_PREMIUM_ARTICLE: { type: Number, default: 5 },
        AUTHOR_BREAKING_NEWS: { type: Number, default: 10 },
        AUTHOR_SEO_OPTIMIZED: { type: Number, default: 5 },
        AUTHOR_TRENDING_10: { type: Number, default: 10 },
        AUTHOR_TRENDING_30: { type: Number, default: 30 },

        // Traffic Milestones (Dynamic)
        milestones: [{
            views: { type: Number, required: true },
            credits: { type: Number, required: true },
            title: { type: String }
        }],

        // Admin Credits
        ADMIN_USER_APPROVAL: { type: Number, default: 2 },
        ADMIN_AUTHOR_VERIFICATION: { type: Number, default: 3 },
        ADMIN_ARTICLE_REVIEW: { type: Number, default: 3 },
        ADMIN_ARTICLE_APPROVAL: { type: Number, default: 5 },
        ADMIN_PREMIUM_SELECTION: { type: Number, default: 5 },
        ADMIN_HOMEPAGE_FEATURE: { type: Number, default: 5 },
        ADMIN_COMMUNITY_MGMT: { type: Number, default: 5 },
        ADMIN_SUPPORT_RESOLUTION: { type: Number, default: 5 },
        ADMIN_ARTICLE_PUBLISH: { type: Number, default: 10 },

        // Deductions
        DEDUCT_MISSED_DEADLINE: { type: Number, default: -5 },
        DEDUCT_POOR_QUALITY: { type: Number, default: -5 },
        DEDUCT_CARELESSNESS: { type: Number, default: -10 },
        DEDUCT_UNVERIFIED: { type: Number, default: -20 },
        DEDUCT_PLAGIARISM: { type: Number, default: -50 }
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
