const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    content: { type: String, required: true },
    category: { type: String, required: true },
    featuredImage: { type: String, default: '' },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    isBreakingNews: { type: Boolean, default: false },
    isMainBreaking: { type: Boolean, default: false },
    isCategoryBreaking: { type: String, default: null },
    isBigBreaking: { type: Boolean, default: false },
    breakingType: { type: String, default: null },
    breakingCategory: { type: String, default: null },
    status: { type: String, enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'REVISION_REQUESTED', 'REJECTED'], default: 'DRAFT' },
    revisionMessage: { type: String, default: null },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    views: { type: Number, default: 0 }, // Unique Views
    revisits: { type: Number, default: 0 }, // Returning Views
    opens: { type: Number, default: 0 }, // Total Article Opens
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date, default: null },

    // SEO Configurations
    seoTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    focusKeyword: { type: String, default: '' },
    slug: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    keywords: [{ type: String }],
    robotsDirective: { type: String, default: 'index, follow' },
    openGraphImage: { type: String, default: '' },
    schemaMarkup: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Dynamic Credit Calculations & Score
    seoScore: { type: Number, default: 0 },
    recommendedSeoCredits: { type: Number, default: 0 },
    awardedSeoCredits: { type: Number, default: 0 },
    creditBreakdown: {
        contentQuality: { type: Number, default: 0 },
        originality: { type: Number, default: 0 },
        researchQuality: { type: Number, default: 0 },
        seo: { type: Number, default: 0 },
        images: { type: Number, default: 0 },
        headline: { type: Number, default: 0 },
        publishingBonus: { type: Number, default: 0 }
    },
    totalCredits: { type: Number, default: 0 },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null }
});

articleSchema.index({ authorId: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ slug: 1 }, { unique: true, sparse: true });

articleSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

articleSchema.set('toJSON', { virtuals: true });
articleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Article', articleSchema);
