const mongoose = require('mongoose');
require('dotenv').config();
const Article = require('../models/Article');

const checkCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const articles = await Article.find({}, 'title category status');
        console.log('--- Article Categories ---');
        articles.forEach(a => {
            console.log(`Title: ${a.title} | Category: ${a.category} | Status: ${a.status}`);
        });
        console.log('--------------------------');
        
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
};

checkCategories();
