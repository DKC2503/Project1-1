require('dotenv').config();
const mongoose = require('mongoose');
const AnalyticsLogV1 = require('../models/AnalyticsLogV1');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newspercent');
        const logs = await AnalyticsLogV1.find().limit(5).lean();
        console.log('Total Logs:', await AnalyticsLogV1.countDocuments());
        console.log('Sample logs:', logs);
        if (logs.length > 0) {
            console.log('articleId type:', typeof logs[0].articleId, 'instanceof ObjectId:', logs[0].articleId instanceof mongoose.Types.ObjectId);
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}
test();
