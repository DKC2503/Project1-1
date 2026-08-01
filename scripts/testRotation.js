const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ override: true });

const StorageConfig = require('../models/StorageConfig');
const StorageHistory = require('../models/StorageHistory');
const { decrypt } = require('../utils/crypto');
const uploadArticleImage = require('../services/uploadArticleImage');
const uploadProfileImage = require('../services/uploadProfileImage');

// 1x1 transparent GIF buffer
const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

async function testRotation() {
    console.log("=== STARTING CLOUDINARY ROTATION TESTS ===");
    let success = true;

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for tests.");

        // Clear any old test configurations
        await StorageConfig.deleteMany({});
        await StorageHistory.deleteMany({});
        console.log("Cleared test configs and history log.");

        // Test 1: Fallback (No DB config)
        console.log("\n[TEST 1] Upload Article Image - Falling back to .env");
        const fallbackRes = await uploadArticleImage(testImageBuffer, 'newspercent/articles');
        console.log("Uploaded URL:", fallbackRes.secure_url);
        if (fallbackRes.secure_url.includes('drwmn7kki')) {
            console.log("✅ SUCCESS: Fell back correctly to drwmn7kki (.env)");
        } else {
            console.error("❌ FAILURE: Uploaded to wrong cloud");
            success = false;
        }

        // Test 2: Verify Credentials (using correct credentials)
        console.log("\n[TEST 2] Verify Credentials simulation");
        // We will simulate verification by calling cloudinary upload using ARTICLE credentials
        const cloudinary = require('cloudinary').v2;
        const verifyRes = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    cloud_name: process.env.ARTICLE_CLOUD_NAME,
                    api_key: process.env.ARTICLE_API_KEY,
                    api_secret: process.env.ARTICLE_API_SECRET,
                    folder: 'newspercent/test-connection',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(testImageBuffer);
        });
        console.log("Verification upload result:", verifyRes.secure_url);
        console.log("✅ SUCCESS: Verification test upload completed.");

        // Test 3: Save credentials dynamically & Verify Encryption
        console.log("\n[TEST 3] Rotate credentials (save to DB with encryption)");
        const { encrypt } = require('../utils/crypto');
        
        // We will rotate to the same credentials but write them to DB to test the flow
        const rotatedCloudName = process.env.ARTICLE_CLOUD_NAME;
        const rotatedApiKey = process.env.ARTICLE_API_KEY;
        const rotatedApiSecret = process.env.ARTICLE_API_SECRET; // cleartext

        const encryptedSecret = encrypt(rotatedApiSecret);
        console.log("Original Secret:", rotatedApiSecret);
        console.log("Encrypted Secret stored in DB:", encryptedSecret);

        if (encryptedSecret === rotatedApiSecret) {
            console.error("❌ FAILURE: Secret was not encrypted!");
            success = false;
        } else {
            console.log("✅ SUCCESS: Secret encrypted successfully.");
        }

        // Save Config
        const savedConfig = await StorageConfig.create({
            cloudName: rotatedCloudName,
            apiKey: rotatedApiKey,
            apiSecret: encryptedSecret,
            folderPrefix: 'newspercent-rotated',
            status: 'Connected',
            updatedBy: 'Test Runner Admin',
            updatedAt: Date.now()
        });

        // Write Audit trail
        await StorageHistory.create({
            adminName: 'Test Runner Admin',
            oldCloudName: 'Default (.env)',
            newCloudName: rotatedCloudName,
            reason: 'Test credentials rotation to database'
        });
        console.log("✅ SUCCESS: Config and Audit history created in database.");

        // Test 4: Upload Article Image - Dynamic Database pickup
        console.log("\n[TEST 4] Upload Article Image - Reading from DB");
        const rotatedRes = await uploadArticleImage(testImageBuffer, 'newspercent-rotated/articles');
        console.log("Uploaded URL:", rotatedRes.secure_url);
        if (rotatedRes.secure_url.includes(rotatedCloudName)) {
            console.log("✅ SUCCESS: Dynamically uploaded using credentials from DB.");
        } else {
            console.error("❌ FAILURE: Upload did not use DB configuration.");
            success = false;
        }

        // Test 5: Verify isolation of Profile uploads
        console.log("\n[TEST 5] Upload Profile Image - Verifying isolation");
        const profileRes = await uploadProfileImage(testImageBuffer, 'newspercent/profiles/admins');
        console.log("Uploaded Profile URL:", profileRes.secure_url);
        if (profileRes.secure_url.includes(process.env.PROFILE_CLOUD_NAME) && !profileRes.secure_url.includes(rotatedCloudName)) {
            console.log("✅ SUCCESS: Profile upload is isolated and used PROFILE account (dfioywoci).");
        } else {
            console.error("❌ FAILURE: Profile upload was affected by rotation!");
            success = false;
        }

        // Test 6: Verify history log
        console.log("\n[TEST 6] Verify audit trail logs");
        const auditLog = await StorageHistory.findOne({ adminName: 'Test Runner Admin' });
        if (auditLog) {
            console.log("Audit log found:", auditLog);
            console.log("✅ SUCCESS: Audit trail correctly logged.");
        } else {
            console.error("❌ FAILURE: Audit trail was not logged.");
            success = false;
        }

    } catch (err) {
        console.error("❌ TEST ROTATION FAILED WITH ERROR:", err);
        success = false;
    } finally {
        // Disconnect Mongoose
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB.");
    }

    console.log("\n=============================================");
    if (success) {
        console.log("🎉 ROTATION & ISOLATION TESTS PASSED! 🎉");
    } else {
        console.error("🚨 ROTATION TESTS FAILED. CHECK LOGS. 🚨");
    }
    console.log("=============================================");
}

testRotation();
