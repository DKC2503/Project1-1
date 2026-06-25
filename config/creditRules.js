const CREDIT_RULES = {
    // AUTHOR RULES
    AUTHOR_ARTICLE_PUBLISH: { title: 'Approved Article', role: 'author', credits: 10 },
    AUTHOR_PREMIUM_ARTICLE: { title: 'Premium Article', role: 'author', credits: 5 },
    AUTHOR_BREAKING_NEWS: { title: 'Breaking News', role: 'author', credits: 10 },
    AUTHOR_SEO_OPTIMIZED: { title: 'SEO Optimized Article', role: 'author', credits: 5 },
    AUTHOR_TRENDING_10: { title: 'Trending Article (Low)', role: 'author', credits: 10 },
    AUTHOR_TRENDING_30: { title: 'Trending Article (High)', role: 'author', credits: 30 },
    
    // Traffic Milestones
    AUTHOR_VIEWS_500: { title: '500 Views Milestone', role: 'author', credits: 5 },
    AUTHOR_VIEWS_1000: { title: '1,000 Views Milestone', role: 'author', credits: 10 },
    AUTHOR_VIEWS_5000: { title: '5,000 Views Milestone', role: 'author', credits: 20 },
    AUTHOR_VIEWS_10000: { title: '10,000+ Views Milestone', role: 'author', credits: 50 },

    // ADMIN RULES
    ADMIN_USER_APPROVAL: { title: 'User Approval', role: 'admin', credits: 2 },
    ADMIN_AUTHOR_VERIFICATION: { title: 'Author Verification', role: 'admin', credits: 3 },
    ADMIN_ARTICLE_REVIEW: { title: 'Article Review', role: 'admin', credits: 3 },
    ADMIN_ARTICLE_APPROVAL: { title: 'Article Approval', role: 'admin', credits: 5 },
    ADMIN_PREMIUM_SELECTION: { title: 'Premium Content Selection', role: 'admin', credits: 5 },
    ADMIN_HOMEPAGE_FEATURE: { title: 'Homepage Feature Selection', role: 'admin', credits: 5 },
    ADMIN_COMMUNITY_MGMT: { title: 'Community Management', role: 'admin', credits: 5 },
    ADMIN_SUPPORT_RESOLUTION: { title: 'User Support Resolution', role: 'admin', credits: 5 },
    ADMIN_ARTICLE_PUBLISH: { title: 'Admin Article Publish', role: 'admin', credits: 10 },

    // DEDUCTIONS
    DEDUCT_MISSED_DEADLINE: { title: 'Missed Deadline', credits: -5 },
    DEDUCT_POOR_QUALITY: { title: 'Poor Quality Submission', credits: -5 },
    DEDUCT_CARELESSNESS: { title: 'Repeated Carelessness', credits: -10 },
    DEDUCT_UNVERIFIED: { title: 'Unverified Information', credits: -20 },
    DEDUCT_PLAGIARISM: { title: 'Plagiarism', credits: -50 }
};

module.exports = CREDIT_RULES;
