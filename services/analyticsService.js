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

            // 2. If it's a Page View for an Article, update article-wise and summary statistics in DB
            if (type === 'PAGE_VIEW' && articleId) {
                // Check if this visitor has viewed this article before (unique check)
                const previousLog = await AnalyticsLogV1.findOne({
                    visitorId,
                    type: 'PAGE_VIEW',
                    articleId
                });

                if (previousLog) {
                    // Revisit
                    await Article.findByIdAndUpdate(articleId, {
                        $inc: { revisits: 1, opens: 1 }
                    });
                    const Analytics = require('../models/Analytics');
                    await Analytics.findOneAndUpdate(
                        { articleId },
                        { $inc: { revisits: 1, views: 1 }, updatedAt: new Date() },
                        { upsert: true }
                    );
                } else {
                    // Unique View
                    await Article.findByIdAndUpdate(articleId, {
                        $inc: { views: 1, opens: 1 } // Article.views stores Unique Views
                    });
                    const Analytics = require('../models/Analytics');
                    await Analytics.findOneAndUpdate(
                        { articleId },
                        { $inc: { uniqueVisitors: 1, views: 1 }, updatedAt: new Date() },
                        { upsert: true }
                    );
                }
            }

            // 3. Create Log Entry
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
                            { $unwind: { path: "$visitor", preserveNullAndEmptyArrays: true } },
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
                            { $unwind: { path: "$visitor", preserveNullAndEmptyArrays: true } },
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
    },

    /**
     * Generate Monthly Performance Report
     */
    generateMonthlyReport: async (format = 'excel') => {
        try {
            const Article = require('../models/Article');
            const AnalyticsLogV1 = require('../models/AnalyticsLogV1');
            const XLSX = require('xlsx');

            // 1. Fetch live published articles
            const articles = await Article.find({ status: 'PUBLISHED' }).sort({ views: -1 });

            // 2. Compute overall totals
            let totalUniqueViews = 0;
            let totalRevisits = 0;
            let totalLikes = 0;
            let totalShares = 0;

            articles.forEach(a => {
                totalUniqueViews += (a.views || 0);
                totalRevisits += (a.revisits || 0);
                totalLikes += (a.likes || 0);
                totalShares += (a.shares || 0);
            });

            // 3. Top performing articles (top 15)
            const topArticles = articles.slice(0, 15);

            // 4. Monthly trend data (last 30 days of traffic)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const trend = await AnalyticsLogV1.aggregate([
                { $match: { timestamp: { $gte: thirtyDaysAgo }, type: 'PAGE_VIEW' } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        totalViews: { $sum: 1 },
                        unique: { $addToSet: "$visitorId" }
                    }
                },
                {
                    $project: {
                        date: "$_id",
                        totalViews: 1,
                        uniqueViews: { $size: "$unique" },
                        _id: 0
                    }
                },
                { $sort: { date: 1 } }
            ]);

            if (format === 'excel') {
                // Build Workbook
                const wb = XLSX.utils.book_new();

                // Setup summary sheet data grid
                const summaryData = [
                    ['NEWS_PERCENT WEB PLATFORM'],
                    ['MONTHLY PERFORMANCE INTEL REPORT'],
                    [],
                    ['SYSTEM-WIDE STATS OVERVIEW'],
                    ['KPI Parameter', 'Aggregated Metrics', 'System Status'],
                    ['Total Unique Views (Visitors)', totalUniqueViews, 'VERIFIED'],
                    ['Total User Revisits', totalRevisits, 'VERIFIED'],
                    ['Total Article Likes', totalLikes, 'VERIFIED'],
                    ['Total Article Shares', totalShares, 'VERIFIED'],
                    [],
                    ['TOP PERFORMING ARTICLES'],
                    ['Article Title', 'Author Uploaded By', 'Published Date', 'Unique Views', 'Revisits', 'Likes', 'Shares']
                ];

                topArticles.forEach(a => {
                    summaryData.push([
                        a.title,
                        a.authorName,
                        a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'N/A',
                        a.views || 0,
                        a.revisits || 0,
                        a.likes || 0,
                        a.shares || 0
                    ]);
                });

                summaryData.push([], ['DAILY GROWTH TRENDS'], ['Log Date', 'Total Raw Hits', 'Unique Visitors']);
                if (trend.length === 0) {
                    summaryData.push(['No logs recorded yet', 0, 0]);
                } else {
                    trend.forEach(t => {
                        summaryData.push([t.date, t.totalViews, t.uniqueViews]);
                    });
                }

                const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

                // Auto-fit column widths
                const autofitCols = (dataGrid) => {
                    const maxLens = [];
                    dataGrid.forEach(row => {
                        if (!row) return;
                        row.forEach((cell, idx) => {
                            const val = String(cell || '');
                            maxLens[idx] = Math.max(maxLens[idx] || 10, val.length + 3);
                        });
                    });
                    return maxLens.map(w => ({ wch: w }));
                };

                wsSummary['!cols'] = autofitCols(summaryData);
                XLSX.utils.book_append_sheet(wb, wsSummary, 'Overall Site Summary');

                // Build Article-wise sheet
                const articleSheetData = [
                    ['Article TitleName', 'Author Uploaded By', 'Published Date', 'Unique Views', 'Revisits', 'Likes', 'Shares', 'Total Article Opens']
                ];

                articles.forEach(a => {
                    articleSheetData.push([
                        a.title,
                        a.authorName,
                        a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'N/A',
                        a.views || 0,
                        a.revisits || 0,
                        a.likes || 0,
                        a.shares || 0,
                        a.opens || 0
                    ]);
                });

                const wsArticles = XLSX.utils.aoa_to_sheet(articleSheetData);
                wsArticles['!cols'] = autofitCols(articleSheetData);
                XLSX.utils.book_append_sheet(wb, wsArticles, 'Article Performance Data');

                // Write workbook
                const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
                return buffer;
            } else {
                // CSV raw data
                const csvLines = [];
                csvLines.push('NEWS_PERCENT MONTHLY PERFORMANCE REPORT');
                csvLines.push('');
                csvLines.push('OVERALL SITE SUMMARY');
                csvLines.push(`Total Unique Views,${totalUniqueViews}`);
                csvLines.push(`Total Revisits,${totalRevisits}`);
                csvLines.push(`Total Likes,${totalLikes}`);
                csvLines.push(`Total Shares,${totalShares}`);
                csvLines.push('');
                csvLines.push('ARTICLE PERFORMANCE DATA');
                csvLines.push('Article TitleName,Uploaded By,Published Date,Unique Views,Revisits,Likes,Shares,Total Opens');
                
                articles.forEach(a => {
                    const cleanTitle = a.title.replace(/"/g, '""');
                    const cleanAuthor = a.authorName.replace(/"/g, '""');
                    const pubDate = a.publishedAt ? new Date(a.publishedAt).toISOString() : 'N/A';
                    csvLines.push(`"${cleanTitle}","${cleanAuthor}",${pubDate},${a.views || 0},${a.revisits || 0},${a.likes || 0},${a.shares || 0},${a.opens || 0}`);
                });

                csvLines.push('');
                csvLines.push('DAILY GROWTH TRENDS');
                csvLines.push('Date,Total Raw Hits,Unique Visitors');
                trend.forEach(t => {
                    csvLines.push(`${t.date},${t.totalViews},${t.uniqueViews}`);
                });

                return Buffer.from(csvLines.join('\n'), 'utf-8');
            }
        } catch (err) {
            console.error('[AnalyticsService] Report Compile Error:', err);
            throw err;
        }
    }
};

module.exports = analyticsService;
