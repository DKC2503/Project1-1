const { connectDB } = require('../config/database');
const Article = require('../models/Article');
require('dotenv').config();

async function run() {
    await connectDB();
    const articles = await Article.find({});
    console.log(JSON.stringify(articles.map(a => ({
        title: a.title.substring(0, 45),
        category: a.category,
        isBreakingNews: a.isBreakingNews,
        isCategoryBreaking: a.isCategoryBreaking,
        isMainBreaking: a.isMainBreaking,
        isBigBreaking: a.isBigBreaking
    })), null, 2));
    process.exit(0);
}
run().catch(console.error);
