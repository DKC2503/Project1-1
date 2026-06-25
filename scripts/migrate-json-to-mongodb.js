const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const User = require('../models/User');
const Article = require('../models/Article');
const BreakingNews = require('../models/BreakingNews');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const BREAKING_FILE = path.join(DATA_DIR, 'breaking.json');

const readJSON = (file) => {
    try {
        if (!fs.existsSync(file)) return [];
        const content = fs.readFileSync(file, 'utf8');
        return content ? JSON.parse(content) : [];
    } catch (err) {
        console.error(`Error reading ${file}:`, err);
        return [];
    }
};

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for migration...');

        // 1. Migrate Users
        const usersData = readJSON(USERS_FILE);
        let usersMigrated = 0;
        for (const user of usersData) {
            const exists = await User.findOne({ email: user.email });
            if (!exists) {
                await User.create({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                });
                usersMigrated++;
            }
        }

        // 2. Migrate Articles
        const newsData = readJSON(NEWS_FILE);
        let articlesMigrated = 0;
        for (const article of newsData) {
            // Using ID or Title as a check. Since IDs in JSON are strings like "1780695300620"
            const exists = await Article.findOne({ title: article.title, authorId: article.authorId });
            if (!exists) {
                await Article.create({
                    title: article.title,
                    subtitle: article.subtitle,
                    content: article.content,
                    category: article.category,
                    featuredImage: article.featuredImage,
                    authorId: article.authorId,
                    authorName: article.authorName,
                    status: article.status,
                    revisionMessage: article.revisionMessage,
                    reviewedBy: article.reviewedBy,
                    reviewedAt: article.reviewedAt,
                    createdAt: article.createdAt,
                    updatedAt: article.updatedAt,
                    publishedAt: article.publishedAt,
                    views: 0,
                    likes: 0,
                    shares: 0
                });
                articlesMigrated++;
            }
        }

        // 3. Migrate Breaking News
        const breakingData = readJSON(BREAKING_FILE);
        let breakingMigrated = 0;
        for (const item of breakingData) {
            const title = item.title || item.text;
            const exists = await BreakingNews.findOne({ title: title });
            if (!exists) {
                await BreakingNews.create({
                    title: title,
                    content: item.content || '',
                    priority: item.priority || 1,
                    isActive: item.isActive !== undefined ? item.isActive : true,
                    createdAt: item.createdAt || Date.now()
                });
                breakingMigrated++;
            }
        }

        console.log('\n--- Migration Summary ---');
        console.log(`Users Migrated: ${usersMigrated}`);
        console.log(`Articles Migrated: ${articlesMigrated}`);
        console.log(`Breaking News Migrated: ${breakingMigrated}`);
        console.log('-------------------------\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
