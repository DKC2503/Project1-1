const dotenv = require('dotenv');
dotenv.config({ override: true });

const uploadProfileImage = require('../services/uploadProfileImage');
const uploadArticleImage = require('../services/uploadArticleImage');

// 1x1 transparent GIF buffer
const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

async function runTests() {
    console.log("=== STARTING CLOUDINARY INTEGRATION TESTS ===");
    let success = true;

    try {
        console.log("\n[TEST 1] Upload Admin Profile Picture");
        const adminResult = await uploadProfileImage(testImageBuffer, 'newspercent/profiles/admins');
        console.log("Uploaded Admin Profile URL:", adminResult.secure_url);
        console.log("Public ID:", adminResult.public_id);
        if (adminResult.secure_url.includes('dfioywoci')) {
            console.log("✅ SUCCESS: Stored in CURRENT Cloudinary Account (dfioywoci)");
        } else {
            console.error("❌ FAILURE: Incorrect Cloudinary account");
            success = false;
        }
    } catch (err) {
        console.error("❌ TEST 1 FAILED WITH ERROR:", err);
        success = false;
    }

    try {
        console.log("\n[TEST 2] Upload Author Profile Picture");
        const authorResult = await uploadProfileImage(testImageBuffer, 'newspercent/profiles/authors');
        console.log("Uploaded Author Profile URL:", authorResult.secure_url);
        console.log("Public ID:", authorResult.public_id);
        if (authorResult.secure_url.includes('dfioywoci')) {
            console.log("✅ SUCCESS: Stored in CURRENT Cloudinary Account (dfioywoci)");
        } else {
            console.error("❌ FAILURE: Incorrect Cloudinary account");
            success = false;
        }
    } catch (err) {
        console.error("❌ TEST 2 FAILED WITH ERROR:", err);
        success = false;
    }

    try {
        console.log("\n[TEST 3] Upload Featured Image (Article)");
        const articleResult = await uploadArticleImage(testImageBuffer, 'newspercent/articles');
        console.log("Uploaded Article Image URL:", articleResult.secure_url);
        console.log("Public ID:", articleResult.public_id);
        if (articleResult.secure_url.includes('drwmn7kki')) {
            console.log("✅ SUCCESS: Stored in NEW Cloudinary Account (drwmn7kki)");
        } else {
            console.error("❌ FAILURE: Incorrect Cloudinary account");
            success = false;
        }
    } catch (err) {
        console.error("❌ TEST 3 FAILED WITH ERROR:", err);
        success = false;
    }

    try {
        console.log("\n[TEST 4] Upload Breaking News Image");
        const breakingResult = await uploadArticleImage(testImageBuffer, 'newspercent/breaking-news');
        console.log("Uploaded Breaking News Image URL:", breakingResult.secure_url);
        console.log("Public ID:", breakingResult.public_id);
        if (breakingResult.secure_url.includes('drwmn7kki')) {
            console.log("✅ SUCCESS: Stored in NEW Cloudinary Account (drwmn7kki)");
        } else {
            console.error("❌ FAILURE: Incorrect Cloudinary account");
            success = false;
        }
    } catch (err) {
        console.error("❌ TEST 4 FAILED WITH ERROR:", err);
        success = false;
    }

    console.log("\n=============================================");
    if (success) {
        console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉");
    } else {
        console.error("🚨 SOME TESTS FAILED. CHECK LOGS above. 🚨");
    }
    console.log("=============================================");
}

runTests();
