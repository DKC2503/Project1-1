const dns = require('dns').promises;
const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const testAtlasConnection = async () => {
    console.log('=============================================');
    console.log('🔍 MongoDB Atlas Connectivity Diagnostic Tool');
    console.log('=============================================\n');

    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ FAIL: MONGODB_URI is not defined in your .env file.');
        process.exit(1);
    }

    console.log('✅ PASS: MONGODB_URI is defined.');

    let isSrv = false;
    let usernameHost = '';

    // 1. Analyze URI format
    if (uri.startsWith('mongodb+srv://')) {
        isSrv = true;
        console.log('ℹ️  INFO: Connection string uses SRV (mongodb+srv://).');
        
        try {
            const hostWithQuery = uri.split('mongodb+srv://')[1];
            const host = hostWithQuery.split('/')[0].split('?')[0];
            usernameHost = host.includes('@') ? host.split('@')[1] : host;
            console.log(`ℹ️  INFO: Target cluster hostname: ${usernameHost}`);
        } catch (e) {
            console.error('❌ FAIL: Malformed mongodb+srv connection string.');
            process.exit(1);
        }
    } else {
        console.log('ℹ️  INFO: Standard mongodb:// connection string detected.');
    }

    // 2. DNS/SRV Lookup Diagnostics
    if (isSrv) {
        console.log(`\nTesting DNS SRV lookup for: _mongodb._tcp.${usernameHost}...`);
        try {
            const addresses = await dns.resolveSrv(`_mongodb._tcp.${usernameHost}`);
            console.log(`✅ PASS: SRV lookup successful. Found ${addresses.length} target(s):`);
            addresses.forEach(addr => console.log(`   -> ${addr.name}:${addr.port}`));
        } catch (err) {
            console.error(`❌ FAIL: SRV lookup failed (querySrv ECONNREFUSED or timeout).`);
            console.error('\n--- DIAGNOSIS ---');
            console.error('This is a network-level DNS block, not a code issue.');
            console.error('Your computer or network is refusing to resolve the MongoDB Atlas domain.');
            console.error('\nSolutions:');
            console.error('1. Change your DNS server to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare).');
            console.error('2. Disable VPNs or corporate proxies that block port 53.');
            console.error('3. Check firewall or antivirus settings.');
            console.error('\nDetailed Error:', err.message);
            process.exit(1);
        }
    }

    // 3. Mongoose Connection Test
    console.log('\nTesting direct Mongoose connection...');
    try {
        const start = Date.now();
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        const duration = Date.now() - start;
        console.log(`✅ PASS: Successfully connected to MongoDB Atlas in ${duration}ms!`);
        
        console.log('\nClosing connection...');
        await mongoose.disconnect();
        console.log('✅ PASS: Connection closed cleanly.');
        process.exit(0);
    } catch (err) {
        console.error(`❌ FAIL: Mongoose connection failed.`);
        console.error('\n--- DIAGNOSIS ---');
        if (err.name === 'MongoNetworkError') {
            console.error('The network connection was refused. Check your IP Whitelist in MongoDB Atlas.');
        } else if (err.name === 'MongoServerError' && err.code === 8000) {
            console.error('Authentication failed. Check your database username and password in the URI.');
        } else {
            console.error('Database connection timed out or failed for an unknown reason.');
        }
        console.error('\nDetailed Error:', err.message);
        process.exit(1);
    }
};

testAtlasConnection();
