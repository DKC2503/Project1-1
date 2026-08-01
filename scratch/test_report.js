require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const analyticsService = require('../services/analyticsService');
const fs = require('fs');
const path = require('path');

async function test() {
    try {
        console.log("Connecting to MongoDB via project helper...");
        await connectDB();
        console.log("Connected successfully!");

        console.log("Generating Excel report...");
        const excelReport = await analyticsService.generateMonthlyReport('excel');
        console.log("Excel report buffer size:", excelReport.length);
        fs.writeFileSync(path.join(__dirname, 'test_report.xlsx'), excelReport);
        console.log("Successfully wrote test_report.xlsx");

        console.log("Generating CSV report...");
        const csvReport = await analyticsService.generateMonthlyReport('csv');
        console.log("CSV report buffer size:", csvReport.length);
        fs.writeFileSync(path.join(__dirname, 'test_report.csv'), csvReport);
        console.log("Successfully wrote test_report.csv");

    } catch (err) {
        console.error("Test failed with error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

test();
