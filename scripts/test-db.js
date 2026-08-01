const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('ERROR: MONGODB_URI is not defined in .env');
            process.exit(1);
        }
        
        console.log('Attempting to connect to MongoDB Atlas...');
        // Set a timeout to prevent hanging forever
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds
            connectTimeoutMS: 5000,
        });
        
        console.log('SUCCESS: Connected to MongoDB Atlas!');
        process.exit(0);
    } catch (err) {
        console.error('CONNECTION FAILED:');
        console.error(err.message);
        if (err.name === 'MongoNetworkError') {
            console.error('Hint: This is often caused by IP Whitelist restrictions in MongoDB Atlas. Ensure your current IP is whitelisted.');
        } else if (err.name === 'MongoServerError' && err.code === 8000) {
            console.error('Hint: This might be an authentication issue. Check your username and password in the MONGODB_URI.');
        }
        process.exit(1);
    }
};

testConnection();
