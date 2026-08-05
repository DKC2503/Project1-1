const Article = require('../models/Article');
const mongoose = require('mongoose');

/**
 * Clean up expired breaking news articles and run auto-promotion logic if slots are empty/expired.
 */
async function cleanupExpiredBreaking() {
    try {
        const now = new Date();

        // 1. Check if the current Main Breaking article has expired
        const expiredMain = await Article.findOne({
            isMainBreaking: true,
            $or: [
                { mainBreakingUntil: { $lte: now } },
                { mainBreakingUntil: null } // Safety check for articles with missing expire dates
            ]
        });

        if (expiredMain) {
            console.log(`[Breaking News Cleanup] Main breaking article ${expiredMain._id} expired or missing expiry timestamp.`);
            expiredMain.isMainBreaking = false;
            expiredMain.mainBreakingUntil = null;
            expiredMain.isBreakingNews = false;
            await expiredMain.save();
        }

        // 2. Check if there is an active valid Main Breaking article
        let activeMain = await Article.findOne({
            isMainBreaking: true,
            mainBreakingUntil: { $gt: now },
            status: 'PUBLISHED'
        });

        // 3. If no active Main Breaking article exists, auto-promote the next eligible candidate
        if (!activeMain) {
            console.log(`[Breaking News Auto-Promotion] No active Main Breaking article found. Querying candidates...`);
            const candidate = await Article.findOne({
                status: 'PUBLISHED',
                isMainBreaking: false
            }).sort({ newsPercentScore: -1, newsPer: -1, publishedAt: -1, views: -1 });

            if (candidate) {
                console.log(`[Breaking News Auto-Promotion] Auto-promoting article ${candidate._id} ("${candidate.title}") to Main Breaking.`);
                candidate.isMainBreaking = true;
                candidate.mainBreakingUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);
                candidate.isBreakingNews = true;
                await candidate.save();
                activeMain = candidate;
            }
        }

        // 4. Check for expired Category Breaking articles
        const expiredCategories = await Article.find({
            isCategoryBreaking: { $exists: true, $ne: null },
            $or: [
                { categoryBreakingUntil: { $lte: now } },
                { categoryBreakingUntil: null }
            ]
        });

        for (const article of expiredCategories) {
            console.log(`[Breaking News Cleanup] Category breaking article ${article._id} for category ${article.isCategoryBreaking} expired or missing expiry timestamp.`);
            article.isCategoryBreaking = null;
            article.categoryBreakingUntil = null;
            await article.save();
        }

        // 5. Check all standard categories and auto-promote if slot is vacant
        const categoriesList = ["Technology", "Business", "Politics", "Sports", "Entertainment", "Science", "Health", "Education", "National", "Global", "Automobile", "Lifestyle", "Movies", "Startups", "Studies", "Case Studies", "Breaking"];
        
        for (const cat of categoriesList) {
            const activeCat = await Article.findOne({
                isCategoryBreaking: { $regex: new RegExp(`^${cat}$`, 'i') },
                categoryBreakingUntil: { $gt: now },
                status: 'PUBLISHED'
            });

            if (!activeCat) {
                // Find best candidate for this specific category
                const candidate = await Article.findOne({
                    status: 'PUBLISHED',
                    category: { $regex: new RegExp(`^${cat}$`, 'i') },
                    isMainBreaking: false,
                    isCategoryBreaking: null
                }).sort({ newsPercentScore: -1, newsPer: -1, publishedAt: -1, views: -1 });

                if (candidate) {
                    console.log(`[Breaking News Auto-Promotion] Auto-promoting article ${candidate._id} to Category Breaking for ${cat}.`);
                    candidate.isCategoryBreaking = cat;
                    candidate.categoryBreakingUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);
                    await candidate.save();
                }
            }
        }
    } catch (err) {
        console.error('[Breaking News Helper Error] cleanupExpiredBreaking failed:', err);
    }
}

/**
 * Retrieves the current valid Main Breaking article.
 */
async function getCurrentMainBreaking() {
    await cleanupExpiredBreaking();
    return await Article.findOne({
        isMainBreaking: true,
        mainBreakingUntil: { $gt: new Date() },
        status: 'PUBLISHED'
    });
}

/**
 * Retrieves the current valid Category Breaking article for a specific category.
 */
async function getCurrentCategoryBreaking(category) {
    await cleanupExpiredBreaking();
    return await Article.findOne({
        isCategoryBreaking: { $regex: new RegExp(`^${category}$`, 'i') },
        categoryBreakingUntil: { $gt: new Date() },
        status: 'PUBLISHED'
    });
}

module.exports = {
    cleanupExpiredBreaking,
    getCurrentMainBreaking,
    getCurrentCategoryBreaking
};
