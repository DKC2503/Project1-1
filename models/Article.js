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
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date, default: null }
});

articleSchema.index({ authorId: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ createdAt: -1 });

articleSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

articleSchema.set('toJSON', { virtuals: true });
articleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Article', articleSchema);
