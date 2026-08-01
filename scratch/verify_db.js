require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Article = require('../models/Article');
const Analytics = require('../models/Analytics');
const AnalyticsLogV1 = require('../models/AnalyticsLogV1');
const ActivityLog = require('../models/ActivityLog');

async function verifyDB() {
    try {
        console.log("Connecting to MongoDB...");
        await connectDB();
        console.log("Connected successfully!\n");

        console.log("=== VERIFYING ARTICLES COLLECTION ===");
        const sampleArticle = await Article.findOne({ status: 'PUBLISHED' });
        if (sampleArticle) {
            console.log(`Found published article: "${sampleArticle.title}"`);
            console.log(`  Views (Unique): ${sampleArticle.views || 0}`);
            console.log(`  Revisits: ${sampleArticle.revisits || 0}`);
            console.log(`  Opens (Total): ${sampleArticle.opens || 0}`);
            console.log(`  Likes: ${sampleArticle.likes || 0}`);
            console.log(`  Shares: ${sampleArticle.shares || 0}`);
        } else {
            console.log("No published articles found in DB.");
        }

        console.log("\n=== VERIFYING ANALYTICS COLLECTION ===");
        const sampleAnalytics = await Analytics.findOne();
        if (sampleAnalytics) {
            console.log("Found analytics summary record:");
            console.log(`  Article ID: ${sampleAnalytics.articleId}`);
            console.log(`  Views: ${sampleAnalytics.views}`);
            console.log(`  Unique Visitors: ${sampleAnalytics.uniqueVisitors}`);
            console.log(`  Revisits: ${sampleAnalytics.revisits}`);
        } else {
            console.log("No analytics summary records found in DB.");
        }

        console.log("\n=== VERIFYING ANALYTICS LOGS COLLECTION ===");
        const logsCount = await AnalyticsLogV1.countDocuments();
        console.log(`Total log entries in AnalyticsLogV1: ${logsCount}`);
        const sampleLog = await AnalyticsLogV1.findOne().sort({ timestamp: -1 });
        if (sampleLog) {
            console.log("Latest log entry sample:");
            console.log(`  Type: ${sampleLog.type}`);
            console.log(`  Visitor ID: ${sampleLog.visitorId}`);
            console.log(`  Article ID: ${sampleLog.articleId || 'N/A'}`);
            console.log(`  Category: ${sampleLog.category || 'N/A'}`);
            console.log(`  Timestamp: ${sampleLog.timestamp}`);
        }

        console.log("\n=== VERIFYING ACTIVITY LOGS COLLECTION ===");
        const activityCount = await ActivityLog.countDocuments();
        console.log(`Total log entries in ActivityLog: ${activityCount}`);

    } catch (err) {
        console.error("Database verification failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB.");
    }
}

verifyDB();
