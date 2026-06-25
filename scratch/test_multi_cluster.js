const mongoose = require('mongoose');
require('dotenv').config({ override: true });
const { 
    connectDB, 
    registerNewCluster, 
    makeClusterActive, 
    getRegisteredClustersList 
} = require('../config/database');

const Article = require('../models/Article');

async function runTest() {
    console.log('--- STARTING MULTI-CLUSTER TESTING SEQUENCE ---');

    // 1. Initial connection
    await connectDB();
    
    const listBefore = await getRegisteredClustersList();
    console.log('Initially registered clusters:', listBefore.map(c => ({
        id: c.clusterId,
        name: c.clusterName,
        db: c.databaseName,
        status: c.status,
        isActive: c.isActive
    })));

    // 2. Register secondary cluster
    // Using standard replica set URI format (since DNS SRV resolver is blocked locally, we connect to the shard hosts directly)
    const secondaryUri = 'mongodb://newsprecent57_db_user:aG6oEFP8EN8URCnY@ac-m7j8tzg-shard-00-00.mtxrxzn.mongodb.net:27017,ac-m7j8tzg-shard-00-01.mtxrxzn.mongodb.net:27017,ac-m7j8tzg-shard-00-02.mtxrxzn.mongodb.net:27017/test_new_cluster?authSource=admin&replicaSet=atlas-t248fy-shard-0&tls=true&appName=news2';
    
    console.log('\n--- Registering Cluster #2 ---');
    const regResult = await registerNewCluster(secondaryUri, 'Standby backup storage for test runs');
    console.log('Registration result:', regResult.success ? 'SUCCESS' : 'FAILED', regResult.cluster?.clusterId);

    const listAfterReg = await getRegisteredClustersList();
    console.log('Inventory after registration:', listAfterReg.map(c => ({
        id: c.clusterId,
        name: c.clusterName,
        db: c.databaseName,
        status: c.status,
        isActive: c.isActive
    })));

    const clusterId2 = regResult.cluster.clusterId;

    // 3. Write document to default active write cluster (default)
    console.log('\n--- Writing Article A to Cluster #1 (Default) ---');
    const articleA = await Article.create({
        title: 'Article A - Primary Cluster',
        content: 'This article is stored in cluster 1.',
        category: 'NEWS',
        authorId: 'test_author_1',
        authorName: 'Author 1'
    });
    console.log('Created Article A ID:', articleA._id);

    // 4. Switch active write cluster to Cluster #2
    console.log(`\n--- Switching Active Write Cluster to: ${clusterId2} ---`);
    await makeClusterActive(clusterId2);
    
    const listAfterActivation = await getRegisteredClustersList();
    console.log('Active Write Cluster is now:', listAfterActivation.find(c => c.isActive)?.clusterName);

    // 5. Write document to new active write cluster (Cluster #2)
    console.log('\n--- Writing Article B to Cluster #2 (Active) ---');
    const articleB = await Article.create({
        title: 'Article B - Secondary Cluster',
        content: 'This article is stored in cluster 2.',
        category: 'NEWS',
        authorId: 'test_author_2',
        authorName: 'Author 2'
    });
    console.log('Created Article B ID:', articleB._id);

    // 6. Query all articles - Verify unified read
    console.log('\n--- Unified Query: Article.find() ---');
    const allArticles = await Article.find({ category: 'NEWS' });
    console.log('Total articles found:', allArticles.length);
    console.log('Found Articles titles:', allArticles.map(a => a.title));

    // Verify both exist in the unified array
    const hasA = allArticles.some(a => a.title === 'Article A - Primary Cluster');
    const hasB = allArticles.some(a => a.title === 'Article B - Secondary Cluster');
    console.log('Unified read holds Article A:', hasA ? '✅ YES' : '❌ NO');
    console.log('Unified read holds Article B:', hasB ? '✅ YES' : '❌ NO');

    // 7. Cleanup
    console.log('\n--- Cleaning up test articles ---');
    await Article.deleteMany({ title: /Article (A|B)/ });
    
    // Switch active back to default
    await makeClusterActive('default');
    console.log('Reverted active cluster to default.');

    // Disconnect all
    console.log('Disconnecting database connections...');
    await mongoose.disconnect();
    
    // Also disconnect secondary connections in config
    const databaseConfig = require('../config/database');
    // For test simplicity, we just exit the process which closes sockets
    console.log('--- TEST RUN COMPLETED ---');
    process.exit(0);
}

runTest().catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
