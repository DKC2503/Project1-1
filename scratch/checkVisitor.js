require('dotenv').config();
const mongoose = require('mongoose');
const VisitorV1 = require('../models/VisitorV1');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newspercent');
        const visitors = await VisitorV1.find().lean();
        console.log('Total Visitors:', visitors.length);
        console.log('Visitors:', visitors);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}
test();
