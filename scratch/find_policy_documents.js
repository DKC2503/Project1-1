require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');

async function findPolicies() {
    try {
        console.log("Connecting to MongoDB...");
        await connectDB();
        console.log("Connected successfully!");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("\nFound collections:", collections.map(c => c.name));

        // Query any collection that might contain terms, policy, advertise, or careers
        for (const col of collections) {
            const name = col.name.toLowerCase();
            if (name.includes('page') || name.includes('policy') || name.includes('term') || name.includes('career') || name.includes('content') || name.includes('about')) {
                console.log(`\n--- Querying Collection: ${col.name} ---`);
                const docs = await db.collection(col.name).find().toArray();
                console.log(docs);
            }
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

findPolicies();
