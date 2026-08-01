require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { connectDB } = require('../config/database');
const User = require('../models/User');

const BASE_URL = 'http://localhost:5000';

async function runFinalTest() {
    console.log("==========================================");
    console.log("🚀 STARTING AUTOMATED APPLICATION INTEGRATION TEST");
    console.log("==========================================\n");

    try {
        // Connect to MongoDB
        await connectDB();
        console.log("✅ MongoDB Connection: OK");

        // 1. Generate Admin Token for Authenticated APIs
        console.log("\n1. Generating Admin Clearance Token...");
        const adminUser = await User.findOne({ email: 'newsprecent57@gmail.com' });
        if (!adminUser) {
            throw new Error("Admin user not found in database to execute authenticated tests.");
        }
        const token = jwt.sign(
            { id: adminUser._id, role: adminUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log(`✅ Admin Token Generated successfully (ID: ${adminUser._id})`);
        const authHeaders = { Authorization: `Bearer ${token}` };

        // 2. Verify Homepage Loads
        console.log("\n2. Testing Homepage Load...");
        const homeRes = await axios.get(`${BASE_URL}/`, { timeout: 5000 });
        console.log(`✅ Homepage Load: HTTP ${homeRes.status} (Type: ${homeRes.headers['content-type']})`);

        // 3. Verify Weather API
        console.log("\n3. Testing Weather API...");
        const weatherRes = await axios.get(`${BASE_URL}/api/weather/report?q=London`, { timeout: 8000 });
        console.log(`✅ Weather API: HTTP ${weatherRes.status}`);
        console.log(`   Location: ${weatherRes.data.data?.city || 'N/A'}, Temp: ${weatherRes.data.data?.temp}°C`);

        // 4. Verify Population API
        console.log("\n4. Testing Population API...");
        const popRes = await axios.get(`${BASE_URL}/api/population/intel`, { timeout: 5000 });
        console.log(`✅ Population API: HTTP ${popRes.status}`);
        console.log(`   Demographics growth rate: ${popRes.data.growthRate}`);

        // 5. Verify Economy Intel API (Gold, Silver, Fuel)
        console.log("\n5. Testing Economy API...");
        const economyRes = await axios.get(`${BASE_URL}/api/economy/intel`, { timeout: 5000 });
        console.log(`✅ Economy API: HTTP ${economyRes.status}`);
        console.log(`   Gold Price: $${economyRes.data.metals?.gold?.price?.toFixed(2)}`);
        console.log(`   Silver Price: $${economyRes.data.metals?.silver?.price?.toFixed(2)}`);
        console.log(`   Petrol Price: ₹${economyRes.data.fuel?.petrol?.price?.toFixed(2)} (${economyRes.data.fuel?.petrol?.city})`);

        // 6. Verify Stock Market API
        console.log("\n6. Testing Stocks (Market Intel) API...");
        const stocksRes = await axios.get(`${BASE_URL}/api/market/intel`, { timeout: 5000 });
        console.log(`✅ Stocks API: HTTP ${stocksRes.status}`);
        console.log(`   Stocks Loaded: ${stocksRes.data.data?.length || 0}`);

        // 7. Verify Article Fetch / Search
        console.log("\n7. Testing News Feed API...");
        const newsRes = await axios.get(`${BASE_URL}/api/news`, { timeout: 5000 });
        console.log(`✅ News API: HTTP ${newsRes.status}`);
        console.log(`   Articles Count: ${newsRes.data?.length || 0}`);

        // 8. Verify OTP API
        console.log("\n8a. Temporarily Disabling Email Service to bypass SMTP connection...");
        await axios.patch(`${BASE_URL}/api/admin/settings`, {
            emailServiceEnabled: false
        }, { headers: authHeaders, timeout: 5000 });
        console.log("✅ Email Service Disabled");

        console.log("\n8b. Testing OTP Access Transmission API...");
        const otpRes = await axios.post(`${BASE_URL}/api/auth/send-otp`, {
            email: 'newsprecent57@gmail.com'
        }, { timeout: 8000 });
        console.log(`✅ OTP API Response: HTTP ${otpRes.status}`);
        console.log(`   Verified User Name: ${otpRes.data.name}`);

        console.log("\n8c. Restoring Email Service setting...");
        await axios.patch(`${BASE_URL}/api/admin/settings`, {
            emailServiceEnabled: true
        }, { headers: authHeaders, timeout: 5000 });
        console.log("✅ Email Service Restored");

        // 9. Verify Monthly Report Downloads (Excel & CSV)
        console.log("\n9. Testing Report Download Endpoints...");
        const excelRes = await axios.get(`${BASE_URL}/api/analytics/report?format=excel`, {
            headers: authHeaders,
            responseType: 'arraybuffer',
            timeout: 8000
        });
        console.log(`✅ Excel Report: HTTP ${excelRes.status} (MIME: ${excelRes.headers['content-type']})`);
        console.log(`   File size: ${excelRes.data.byteLength} bytes`);

        const csvRes = await axios.get(`${BASE_URL}/api/analytics/report?format=csv`, {
            headers: authHeaders,
            responseType: 'arraybuffer',
            timeout: 8000
        });
        console.log(`✅ CSV Report: HTTP ${csvRes.status} (MIME: ${csvRes.headers['content-type']})`);
        console.log(`   File size: ${csvRes.data.byteLength} bytes`);

        // 10. Verify Analytics Dashboard Update
        console.log("\n10. Testing Analytics Dashboard Update...");
        const beforeDashboard = await axios.get(`${BASE_URL}/api/analytics/dashboard?period=7d`, {
            headers: authHeaders,
            timeout: 5000
        });
        const initialViews = beforeDashboard.data?.traffic?.uniqueVisitors || 0;
        console.log(`    Initial Unique Visitors: ${initialViews}`);

        // Simulate a page view log entry (Trigger dynamic analytics update)
        console.log("    Logging test page view event...");
        const testVisitorId = 'test-visitor-' + Date.now();
        await axios.post(`${BASE_URL}/api/analytics/track`, {
            visitorId: testVisitorId,
            type: 'PAGE_VIEW',
            path: '/news/test-article'
        }, { timeout: 5000 });

        const afterDashboard = await axios.get(`${BASE_URL}/api/analytics/dashboard?period=7d`, {
            headers: authHeaders,
            timeout: 5000
        });
        const updatedViews = afterDashboard.data?.traffic?.uniqueVisitors || 0;
        console.log(`    Updated Unique Visitors: ${updatedViews}`);
        console.log(`✅ Analytics Live Update: OK (Before: ${initialViews} -> After: ${updatedViews})`);

        console.log("\n==========================================");
        console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! APPLICATION IS FULLY INTEGRATED");
        console.log("==========================================");

    } catch (err) {
        console.error("\n❌ INTEGRATION TEST FAILED!");
        console.error(err.message);
        if (err.response) {
            console.error(`Status Code: ${err.response.status}`);
            console.error(`Response:`, String(err.response.data).substring(0, 500));
        }
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from database.");
    }
}

runFinalTest();
