const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const CreditRule = require('../models/CreditRule');
const ActivityLog = require('../models/ActivityLog');
const CREDIT_RULES = require('../config/creditRules');
const settingsService = require('./settingsService');

const creditService = {
    /**
     * Internal helper to get credit value from DB or SystemSettings
     */
    getCreditValue: async (key) => {
        try {
            // 1. Check for manual/custom override rules in DB first
            const dbRule = await CreditRule.findOne({ key, isActive: true });
            if (dbRule) return dbRule.credits;
            
            // 2. Read from SystemSettings
            const settings = await settingsService.getSettings();
            if (settings.credits && settings.credits[key] !== undefined) {
                return settings.credits[key];
            }

            // 3. Special case for dynamic milestones
            if (key.startsWith('AUTHOR_VIEWS_')) {
                const targetViews = parseInt(key.replace('AUTHOR_VIEWS_', ''));
                const milestone = settings.credits.milestones.find(m => m.views === targetViews);
                if (milestone) return milestone.credits;
            }
            
            // 4. Fallback to hardcoded config (to be removed eventually)
            const configRule = CREDIT_RULES[key];
            return configRule ? (configRule.credits || configRule.score || 0) : 0;
        } catch (err) {
            console.error(`[CreditService] Error fetching rule ${key}:`, err);
            return CREDIT_RULES[key]?.credits || 0;
        }
    },

    /**
     * Award credits to a user
     */
    awardCredits: async (userId, ruleKey, details = {}) => {
        try {
            const settings = await settingsService.getSettings();
            if (!settings.performanceCreditsEnabled) {
                console.log(`[CreditService] SKIPPED: Credit system disabled. Attempted: ${ruleKey} for ${userId}`);
                await ActivityLog.create({
                    userId,
                    action: 'CREDIT_SYSTEM_DISABLED',
                    details: {
                        attemptedAction: ruleKey,
                        ...details,
                        timestamp: new Date()
                    }
                });
                return { success: false, message: 'Credit system is currently disabled.' };
            }

            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            const credits = await creditService.getCreditValue(ruleKey);
            const rule = CREDIT_RULES[ruleKey] || { title: ruleKey };

            // Create Transaction
            await CreditTransaction.create({
                userId,
                role: user.role,
                creditType: ruleKey,
                description: details.description || rule.title,
                credits,
                source: details.source || 'AUTOMATED',
                referenceId: details.referenceId,
                createdAt: new Date()
            });

            // Update User Totals
            const previousCredits = user.totalCredits;
            user.totalCredits += credits;
            user.monthlyCredits += credits;
            user.yearlyCredits += credits;
            user.lastActivityDate = new Date();

            console.log("Credit Awarded:", {
                userId: user._id,
                role: user.role,
                creditsAdded: credits,
                previousCredits: previousCredits,
                newCredits: user.totalCredits
            });

            // Check for Badges
            await creditService.updateBadges(user);

            await user.save();

            // Log Activity
            await ActivityLog.create({
                userId,
                userName: user.name,
                action: 'CREDIT_AWARD',
                details: { ruleKey, credits, ...details }
            });

            return { success: true, creditsAwarded: credits };
        } catch (err) {
            console.error('[CreditService] Award Error:', err);
            return { success: false, error: err.message };
        }
    },

    /**
     * Deduct credits from a user
     */
    deductCredits: async (userId, ruleKey, details = {}) => {
        try {
            const settings = await settingsService.getSettings();
            if (!settings.performanceCreditsEnabled) {
                console.log(`[CreditService] SKIPPED DEDUCTION: Credit system disabled. Attempted: ${ruleKey} for ${userId}`);
                await ActivityLog.create({
                    userId,
                    action: 'CREDIT_SYSTEM_DISABLED',
                    details: {
                        attemptedAction: ruleKey,
                        type: 'DEDUCTION',
                        ...details,
                        timestamp: new Date()
                    }
                });
                return { success: false, message: 'Credit system is currently disabled.' };
            }

            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            const credits = Math.abs(await creditService.getCreditValue(ruleKey)) * -1;
            const rule = CREDIT_RULES[ruleKey] || { title: ruleKey };

            await CreditTransaction.create({
                userId,
                role: user.role,
                creditType: ruleKey,
                description: details.description || rule.title,
                credits,
                source: details.source || 'ADMIN',
                referenceId: details.referenceId,
                createdAt: new Date()
            });

            const previousCredits = user.totalCredits;
            user.totalCredits += credits; // credits is negative
            user.monthlyCredits += credits;

            console.log("Credit Deducted:", {
                userId: user._id,
                role: user.role,
                creditsDeducted: credits,
                previousCredits: previousCredits,
                newCredits: user.totalCredits
            });

            await user.save();

            await ActivityLog.create({
                userId,
                userName: user.name,
                action: 'CREDIT_DEDUCTION',
                details: { ruleKey, credits, ...details }
            });

            return { success: true, creditsDeducted: credits };
        } catch (err) {
            console.error('[CreditService] Deduction Error:', err);
            return { success: false, error: err.message };
        }
    },

    /**
     * Award Badges based on total credits
     */
    updateBadges: async (user) => {
        const thresholds = [
            { name: 'Bronze Contributor', value: 100 },
            { name: 'Silver Contributor', value: 500 },
            { name: 'Gold Contributor', value: 1000 },
            { name: 'Platinum Contributor', value: 5000 },
            { name: 'Diamond Contributor', value: 10000 },
            { name: 'Legend Contributor', value: 25000 }
        ];

        thresholds.forEach(t => {
            if (user.totalCredits >= t.value && !user.badges.includes(t.name)) {
                user.badges.push(t.name);
                user.achievements.push(`Achievement Unlocked: ${t.name}`);
            }
        });
    },

    /**
     * Calculate dynamic ranking score
     */
    calculateRankingScore: (user) => {
        return user.totalCredits;
    },

    /**
     * Automated Article Publish Hook
     */
    processArticlePublish: async (article) => {
        try {
            const user = await User.findById(article.authorId);
            if (!user) return;

            // If the article has dynamic totalCredits saved (from the admin review panel), we award that amount
            if (article.totalCredits && article.totalCredits > 0) {
                const settings = await settingsService.getSettings();
                if (!settings.performanceCreditsEnabled) {
                    console.log(`[CreditService] SKIPPED: Dynamic credit system disabled. Attempted: ${article.totalCredits} for ${article.authorId}`);
                    return;
                }
                
                // Create dynamic transaction record
                await CreditTransaction.create({
                    userId: article.authorId,
                    role: user.role,
                    creditType: 'AUTHOR_DYNAMIC_ARTICLE',
                    description: `Published article: ${article.title} (SEO: +${article.awardedSeoCredits || 0}, Content: +${article.creditBreakdown?.contentQuality || 0}, Headline: +${article.creditBreakdown?.headline || 0})`,
                    credits: article.totalCredits,
                    source: 'AUTOMATED',
                    referenceId: article._id,
                    createdAt: new Date()
                });

                user.totalCredits += article.totalCredits;
                user.monthlyCredits += article.totalCredits;
                user.yearlyCredits += article.totalCredits;
                user.lastActivityDate = new Date();
                
                await creditService.updateBadges(user);
                await user.save();
                
                await ActivityLog.create({
                    userId: article.authorId,
                    userName: user.name,
                    action: 'CREDIT_AWARD',
                    details: { ruleKey: 'AUTHOR_DYNAMIC_ARTICLE', credits: article.totalCredits, referenceId: article._id }
                });
                
                console.log(`[CreditService] Dynamically awarded ${article.totalCredits} total credits to Author ${article.authorId}`);
                return;
            }

            // Fallback for legacy articles or if no dynamic credits are set
            if (['super_admin', 'admin', 'editor', 'reviewer'].includes(user.role)) {
                // Award Admin Publishing Credits
                await creditService.awardCredits(article.authorId, 'ADMIN_ARTICLE_PUBLISH', { 
                    referenceId: article._id,
                    description: `Admin published article: ${article.title}`
                });
            } else {
                // Award Author Publishing Credits
                await creditService.awardCredits(article.authorId, 'AUTHOR_ARTICLE_PUBLISH', { 
                    referenceId: article._id,
                    description: `Published article: ${article.title}`
                });
            }
        } catch (err) {
            console.error('[CreditService] Error processing article publish:', err);
        }
    },

    /**
     * Automated Article Delete Hook to negate credits
     */
    processArticleDelete: async (articleId) => {
        try {
            const transactions = await CreditTransaction.find({ referenceId: articleId });
            for (const tx of transactions) {
                const negateAmount = -tx.credits;
                
                // Create reversing transaction
                await CreditTransaction.create({
                    userId: tx.userId,
                    role: tx.role,
                    creditType: tx.creditType,
                    description: `REVERSED: ${tx.description} (Article deleted)`,
                    credits: negateAmount,
                    source: 'AUTOMATED',
                    referenceId: articleId,
                    createdAt: new Date()
                });

                // Update User document totals
                const user = await User.findById(tx.userId);
                if (user) {
                    user.totalCredits = Math.max(0, user.totalCredits + negateAmount);
                    user.monthlyCredits = Math.max(0, user.monthlyCredits + negateAmount);
                    user.yearlyCredits = Math.max(0, user.yearlyCredits + negateAmount);
                    await user.save();
                    console.log(`[CreditService] Negated ${tx.credits} credits for User ${user._id} due to deletion of Article ${articleId}`);
                }
            }
        } catch (err) {
            console.error('[CreditService] Error processing article delete:', err);
        }
    }
};

module.exports = creditService;
