const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
require('dotenv').config();

const cleanDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully.');

    // Define inline schemas to avoid dependency issues
    const FlashNewsSchema = new mongoose.Schema({
      headline: String,
      active: Boolean
    }, { collection: 'flashnews' });

    const ArticleSchema = new mongoose.Schema({
      title: String,
      status: String
    }, { collection: 'articles' });

    // Use mongoose.model directly, which might be overridden/wrapped by database.js
    const FlashNews = mongoose.model('FlashNews', FlashNewsSchema);
    const Article = mongoose.model('Article', ArticleSchema);

    // 1. Clean FlashNews
    const flashQuery = { headline: { $regex: /sample|test/i } };
    const flashCount = await FlashNews.countDocuments(flashQuery);
    console.log(`Found ${flashCount} sample/test headlines in FlashNews.`);
    if (flashCount > 0) {
      const deletedFlash = await FlashNews.deleteMany(flashQuery);
      console.log(`Successfully deleted ${deletedFlash.deletedCount} FlashNews items.`);
    }

    // 2. Clean Articles
    const articleQuery = { title: { $regex: /sample|test/i } };
    const articleCount = await Article.countDocuments(articleQuery);
    console.log(`Found ${articleCount} sample/test articles in Articles.`);
    if (articleCount > 0) {
      const deletedArticles = await Article.deleteMany(articleQuery);
      console.log(`Successfully deleted ${deletedArticles.deletedCount} Article items.`);
    }

    console.log('Database cleanup completed.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning database:', err);
    process.exit(1);
  }
};

cleanDatabase();
