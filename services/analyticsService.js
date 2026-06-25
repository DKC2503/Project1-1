const VisitorV1 = require('../models/VisitorV1');
const AnalyticsLogV1 = require('../models/AnalyticsLogV1');
const AnalyticsSummaryV1 = require('../models/AnalyticsSummaryV1');
const Article = require('../models/Article');
const User = require('../models/User');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const analyticsService = {
    /**
     * Log a generic analytics event
     */
    trackEvent: async (data) => {
        try {
            const { visitorId, type, articleId, category, searchQuery, readingTime, scrollDepth, path, referrer } = data;

            // 1. Update/Create Visitor
            let visitor = await VisitorV1.findOne({ visitorId });
            if (!visitor) {
                visitor = await VisitorV1.create({ visitorId });
            } else {
                visitor.lastVisit = new Date();
                visitor.isReturning = true;
                await visitor.save();
            }

            // 2. Create Log Entry
            const log = await AnalyticsLogV1.create({
                visitorId,
                type,
                articleId,
                category,
                searchQuery,
                readingTime: readingTime || 0,
                scrollDepth: scrollDepth || 0,
                completed: (scrollDepth || 0) >= 90,
                path,
                referrer,
                timestamp: new Date()
            });

            return log;
        } catch (err) {
            console.error('[AnalyticsService] Track Error:', err);
        }
    },

    /**
     * Get Complete Dashboard Data
     */
    getDashboardData: async (period = '7d') => {
        try {
            const now = new Date();
            let startDate;

            if (period === '24h') startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            else if (period === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            else startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // default 7d

            const prevStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));

            // --- 1. TRAFFIC ANALYTICS ---
            const trafficStats = await AnalyticsLogV1.aggregate([
                { $match: { timestamp: { $gte: prevStartDate } } },
                {
                    $facet: {
                        currentPeriod: [
                            { $match: { timestamp: { $gte: startDate } } },
                            {
                                $group: {
                                    _id: null,
                                    uniqueVisitors: { $addToSet: "$visitorId" },
                                    totalViews: { $sum: { $cond: [{ $eq: ["$type", "PAGE_VIEW"] }, 1, 0] } }
                                }
                            },
                            {
                                $project: {
                                    uniqueVisitorsCount: { $size: "$uniqueVisitors" },
                                    totalViews: 1
                                }
                            }
                        ],
                        previousPeriod: [
                            { $match: { timestamp: { $lt: startDate } } },
                            {
                                $group: {
                                    _id: null,
                                    uniqueVisitors: { $addToSet: "$visitorId" },
                                    totalViews: { $sum: { $cond: [{ $eq: ["$type", "PAGE_VIEW"] }, 1, 0] } }
                                }
                            },
                            {
                                $project: {
                                    uniqueVisitorsCount: { $size: "$uniqueVisitors" },
                                    totalViews: 1
                                }
                            }
                        ],
                        growthChart: [
                            { $match: { timestamp: { $gte: startDate }, type: 'PAGE_VIEW' } },
                            {
                                $group: {
                                    _id: {
                                        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                                        visitorId: "$visitorId"
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'visitorv1s',
                                    localField: '_id.visitorId',
                                    foreignField: 'visitorId',
                                    as: 'visitor'
                                }
                            },
                            { $unwind: "$visitor" },
                            {
                                $group: {
                                    _id: "$_id.date",
                                    uniqueVisitors: { $sum: 1 },
                                    returningVisitors: { $sum: { $cond: ["$visitor.isReturning", 1, 0] } }
                                }
                            },
                            {
                                $project: {
                                    date: "$_id",
                                    uniqueVisitors: 1,
                                    returningVisitors: 1,
                                    _id: 0
                                }
                            },
                            { $sort: { date: 1 } }
                        ],
                        returningStats: [
                            { $match: { timestamp: { $gte: startDate } } },
                            { $group: { _id: "$visitorId" } },
                            {
                                $lookup: {
                                    from: 'visitorv1s',
                                    localField: '_id',
                                    foreignField: 'visitorId',
                                    as: 'visitor'
                                }
                            },
                            { $unwind: "$visitor" },
                            {
                                $group: {
                                    _id: null,
                                    new: { $sum: { $cond: ["$visitor.isReturning", 0, 1] } },
                                    returning: { $sum: { $cond: ["$visitor.isReturning", 1, 0] } }
                                }
                            }
                        ]
                    }
                }
            ]);

            // --- 2. CONTENT ANALYTICS ---
            const contentStats = await AnalyticsLogV1.aggregate([
                { $match: { timestamp: { $gte: startDate } } },
                {
                    $facet: {
                        topArticles: [
                            { $match: { type: 'PAGE_VIEW', articleId: { $ne: null } } },
                            { $group: { _id: "$articleId", views: { $sum: 1 } } },
                            { $sort: { views: -1 } },
                            { $limit: 10 },
                            {
                                $lookup: {
                                    from: 'articles',
                                    localField: '_id',
                                    foreignField: '_id',
                                    as: 'article'
                                }
                            },
                            { $unwind: "$article" },
                            {
                                $project: {
                                    title: "$article.title",
                                    views: 1,
                                    likes: "$article.likes",
                                    shares: "$article.shares",
                                    featuredImage: "$article.featuredImage",
                                    authorName: "$article.authorName",
                                    category: "$article.category",
                                    publishedAt: "$article.publishedAt"
                                }
                            }
                        ],
                        topCategories: [
                            { $match: { type: 'PAGE_VIEW', category: { $ne: null } } },
                            { $group: { _id: "$category", views: { $sum: 1 } } },
                            { $sort: { views: -1 } },
                            { $limit: 10 }
                        ],
                        readingTimeByCategory: [
                            { $match: { type: 'PAGE_VIEW', category: { $ne: null }, readingTime: { $gt: 0 } } },
                            { $group: { _id: "$category", avgTime: { $avg: "$readingTime" } } }
                        ],
                        completionRate: [
                            { $match: { type: 'PAGE_VIEW', articleId: { $ne: null } } },
                            {
                                $group: {
                                    _id: null,
                                    total: { $sum: 1 },
                                    completed: { $sum: { $cond: ["$completed", 1, 0] } }
                                }
                            }
                        ]
                    }
                }
            ]);

            // --- 3. AUTHOR ANALYTICS ---
            // For Author Leaderboard, we aggregate articles views
            const authorLeaderboard = await Article.aggregate([
                { $group: { 
                    _id: "$authorId", 
                    articlesPublished: { $sum: 1 }, 
                    totalViews: { $sum: "$views" },
                    authorName: { $first: "$authorName" }
                }},
                { $sort: { totalViews: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                { $project: {
                    author: "$authorName",
                    articlesPublished: 1,
                    totalViews: 1,
                    credits: "$user.totalCredits"
                }}
            ]);

            // --- 4. READER BEHAVIOR ---
            const behaviorStats = await AnalyticsLogV1.aggregate([
                { $match: { timestamp: { $gte: startDate } } },
                {
                    $facet: {
                        peakHours: [
                            { $match: { type: 'PAGE_VIEW' } },
                            { $group: { _id: { $hour: "$timestamp" }, count: { $sum: 1 } } },
                            { $sort: { _id: 1 } }
                        ],
                        topSearches: [
                            { $match: { type: 'SEARCH', searchQuery: { $ne: null } } },
                            { $group: { _id: "$searchQuery", count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 20 }
                        ]
                    }
                }
            ]);

            // Format results
            const traffic = trafficStats[0];
            const content = contentStats[0];
            const behavior = behaviorStats[0];

            const currentUV = traffic.currentPeriod[0]?.uniqueVisitorsCount || 0;
            const prevUV = traffic.previousPeriod[0]?.uniqueVisitorsCount || 0;
            const uvGrowth = prevUV === 0 ? 100 : Math.round(((currentUV - prevUV) / prevUV) * 100);

            const returning = traffic.returningStats[0] || { new: 0, returning: 0 };
            const returnRate = (returning.new + returning.returning) === 0 ? 0 : Math.round((returning.returning / (returning.new + returning.returning)) * 100);

            const totalViews = content.topCategories.reduce((acc, cat) => acc + cat.views, 0);

            return {
                traffic: {
                    uniqueVisitors: currentUV,
                    growth: uvGrowth,
                    growthChart: traffic.growthChart,
                    returning: {
                        new: returning.new,
                        returning: returning.returning,
                        rate: returnRate
                    }
                },
                content: {
                    topArticles: content.topArticles,
                    topCategories: content.topCategories.map(cat => ({
                        name: cat._id,
                        views: cat.views,
                        percentage: totalViews === 0 ? 0 : Math.round((cat.views / totalViews) * 100)
                    })),
                    readingTime: content.readingTimeByCategory.map(cat => ({
                        category: cat._id,
                        time: cat.avgTime
                    })),
                    completion: {
                        views: content.completionRate[0]?.total || 0,
                        completed: content.completionRate[0]?.completed || 0,
                        rate: (content.completionRate[0]?.total || 0) === 0 ? 0 : Math.round((content.completionRate[0].completed / content.completionRate[0].total) * 100)
                    }
                },
                authors: {
                    leaderboard: authorLeaderboard,
                    // Note: Author growth and top authors could be more complex, but this is a solid V1
                },
                behavior: {
                    peakHours: behavior.peakHours,
                    topSearches: behavior.topSearches.map(s => ({ keyword: s._id, count: s.count }))
                }
            };
        } catch (err) {
            console.error('[AnalyticsService] Dashboard Data Error:', err);
            throw err;
        }
    },

    /**
     * Monthly Archival Process
     */
    archiveMonthlyData: async () => {
        const ARCHIVE_DIR = path.join(__dirname, '../analytics_archive');
        if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

        const now = new Date();
        const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const lastMonth = new Date(firstDayOfCurrentMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthName = lastMonth.toLocaleString('default', { month: 'long' });
        const year = lastMonth.getFullYear();
        const fileName = `${monthName}_${year}_analytics.csv`;
        const filePath = path.join(ARCHIVE_DIR, fileName);

        try {
            // 1. Fetch data to archive (everything before current month)
            const logs = await AnalyticsLogV1.find({
                timestamp: { $lt: firstDayOfCurrentMonth }
            }).lean();

            if (logs.length === 0) return { success: true, message: 'No data to archive' };

            // 2. Convert to CSV
            const headers = ['visitorId', 'type', 'articleId', 'category', 'searchQuery', 'readingTime', 'scrollDepth', 'completed', 'path', 'referrer', 'timestamp'];
            const rows = logs.map(log => [
                log.visitorId,
                log.type,
                log.articleId || '',
                log.category || '',
                `"${(log.searchQuery || '').replace(/"/g, '""')}"`,
                log.readingTime || 0,
                log.scrollDepth || 0,
                log.completed ? 'TRUE' : 'FALSE',
                log.path || '',
                log.referrer || '',
                log.timestamp.toISOString()
            ].join(','));

            const csvContent = [headers.join(','), ...rows].join('\n');
            fs.writeFileSync(filePath, csvContent);

            // 3. Save Summary Statistics (Optional but recommended by prompt)
            try {
                const totalViews = logs.filter(l => l.type === 'PAGE_VIEW').length;
                const uniqueVisitors = new Set(logs.map(l => l.visitorId)).size;
                
                await AnalyticsSummaryV1.create({
                    date: lastMonth,
                    totalViews,
                    uniqueVisitors,
                    updatedAt: new Date()
                });
            } catch (summaryErr) {
                console.error('[AnalyticsService] Summary Save Error (Non-critical):', summaryErr);
            }

            // 4. Purge raw logs
            await AnalyticsLogV1.deleteMany({
                timestamp: { $lt: firstDayOfCurrentMonth }
            });

            return { success: true, fileName, count: logs.length };
        } catch (err) {
            console.error('[AnalyticsService] Archival Error:', err);
            throw err;
        }
    }
};

module.exports = analyticsService;
