const mongoose = require('mongoose');
require('dotenv').config({ override: true });
const { connectDB } = require('../config/database');

async function testSuccess() {
    console.log('--- Testing SUCCESS Connect ---');
    await connectDB();
    await mongoose.disconnect();
}

async function testFail() {
    console.log('\n--- Testing FAIL Connect (Wrong password) ---');
    const oldUri = process.env.MONGODB_URI;
    
    // Inject wrong password in the URI
    process.env.MONGODB_URI = 'mongodb+srv://newsprecent57_db_user:WRONG_PASSWORD@news2.mtxrxzn.mongodb.net/?appName=news2';
    
    try {
        await connectDB();
    } catch (err) {
        console.log('Caught Expected Error:', err.message);
    } finally {
        process.env.MONGODB_URI = oldUri;
    }
}

async function test() {
    await testSuccess();
    await testFail();
}

test().catch(console.error);
