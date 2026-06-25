const { testClusterConnection } = require('../config/database');

async function testCase(name, uri) {
    console.log(`\n--- Test Case: ${name} ---`);
    try {
        await testClusterConnection(uri);
        console.log('✅ Connection Test Succeeded (Unexpected for failure test cases!)');
    } catch (err) {
        console.log(`Caught Expected Error:\n${err.message}`);
    }
}

async function run() {
    // Case 1: Invalid URI
    await testCase(
        'Invalid URI Scheme',
        'http://localhost:27017'
    );

    // Case 2: Unescaped password characters
    await testCase(
        'Unescaped Special Character in Password (@)',
        'mongodb+srv://newsprecent57_db_user:pass@word@news2.mtxrxzn.mongodb.net/?appName=news2'
    );
    await testCase(
        'Unescaped Special Character in Password (:)',
        'mongodb+srv://newsprecent57_db_user:pass:word@news2.mtxrxzn.mongodb.net/?appName=news2'
    );
    await testCase(
        'Unescaped Special Character in Password (+)',
        'mongodb+srv://newsprecent57_db_user:pass+word@news2.mtxrxzn.mongodb.net/?appName=news2'
    );

    // Case 3: Wrong credentials (Atlas Authentication Failed)
    await testCase(
        'Authentication Failure (Wrong Password)',
        'mongodb+srv://newsprecent57_db_user:WRONG_PASSWORD@news2.mtxrxzn.mongodb.net/?appName=news2'
    );

    // Case 4: Non-existent host (DNS Lookup Failed)
    await testCase(
        'DNS Resolution Failure',
        'mongodb+srv://newsprecent57_db_user:aG6oEFP8EN8URCnY@nonexistentcluster.mongodb.net/?appName=news2'
    );
    
    console.log('\n--- ALL TEST CASES RUN COMPLETED ---');
}

run().catch(console.error);
