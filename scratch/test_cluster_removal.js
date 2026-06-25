const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const { 
    connectDB, 
    registerNewCluster, 
    makeClusterActive, 
    removeCluster, 
    getRegisteredClustersList 
} = require('../config/database');

const ActivityLog = require('../models/ActivityLog');

async function testRemoval() {
    console.log('--- STARTING DATABASE CLUSTER REMOVAL TESTS ---');

    // 1. Setup startup connection
    await connectDB();

    // 2. Register a temporary cluster for testing
    const testUri = 'mongodb://newsprecent57_db_user:aG6oEFP8EN8URCnY@ac-m7j8tzg-shard-00-00.mtxrxzn.mongodb.net:27017,ac-m7j8tzg-shard-00-01.mtxrxzn.mongodb.net:27017,ac-m7j8tzg-shard-00-02.mtxrxzn.mongodb.net:27017/test_removal_db?authSource=admin&replicaSet=atlas-t248fy-shard-0&tls=true&appName=news2';
    console.log('\n[1] Registering temporary test cluster...');
    const regRes = await registerNewCluster(testUri, 'Temporary cluster for testing removal safety checks');
    console.log('Registration status:', regRes.success ? '✅ SUCCESS' : '❌ FAILED');
    
    const targetClusterId = regRes.cluster.clusterId;
    const targetClusterName = regRes.cluster.clusterName;

    // 3. Test active write cluster protection
    console.log(`\n[2] Activating test cluster: ${targetClusterId}...`);
    await makeClusterActive(targetClusterId);
    
    console.log('[3] Attempting to remove the active cluster (Should fail)...');
    try {
        await removeCluster(targetClusterId);
        console.log('❌ Unexpected: Active cluster removal was allowed!');
    } catch (err) {
        console.log('✅ Blocked successfully! Catch error message:', err.message);
    }

    // 4. Deactivate and attempt safe removal
    console.log('\n[4] Reverting active write target back to default primary cluster...');
    await makeClusterActive('default');

    console.log(`[5] Removing inactive test cluster: ${targetClusterId} (Should succeed)...`);
    const removeRes = await removeCluster(targetClusterId);
    console.log('Removal status:', removeRes.success ? '✅ SUCCESS' : '❌ FAILED');

    // 5. Verify configuration was cleaned up
    const finalInventory = await getRegisteredClustersList();
    const stillExists = finalInventory.some(c => c.clusterId === targetClusterId);
    console.log('Cluster config still exists in inventory:', stillExists ? '❌ YES' : '✅ NO');

    // 6. Record Audit Log in ActivityLog
    console.log('\n[6] Recording activity audit log to database...');
    // Simulate user identity for logging
    const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Karthik',
        role: 'admin'
    };

    const log = await ActivityLog.create({
        userId: mockUser._id,
        userName: mockUser.name,
        action: 'DATABASE_CLUSTER_REMOVAL',
        ipAddress: '127.0.0.1',
        userAgent: 'Integration Test Suite',
        details: {
            adminName: mockUser.name,
            action: 'Removed Cluster',
            clusterName: targetClusterName,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        }
    });

    console.log('Successfully recorded ActivityLog document:', log._id);
    console.log('Audit Log Contents:', JSON.stringify(log.details, null, 2));

    // Retrieve and verify log
    const savedLog = await ActivityLog.findById(log._id);
    if (savedLog && savedLog.details.adminName === 'Karthik' && savedLog.details.clusterName === targetClusterName) {
        console.log('✅ Audit Log verification passed!');
    } else {
        console.log('❌ Audit Log verification failed!');
    }

    // Clean up audit log
    await ActivityLog.deleteOne({ _id: log._id });
    console.log('Cleaned up test activity log.');

    // Disconnect Mongoose
    await mongoose.disconnect();
    console.log('\n--- ALL TEST CASES RUN COMPLETED ---');
    process.exit(0);
}

testRemoval().catch((err) => {
    console.error('Test run failed:', err);
    process.exit(1);
});
