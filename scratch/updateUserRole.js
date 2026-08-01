require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function makeSuperAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newspercent');
        const email = 'newsprecent57@gmail.com';
        
        let user = await User.findOne({ email });
        if (user) {
            user.role = 'super_admin';
            await user.save();
            console.log(`User ${email} updated to super_admin.`);
        } else {
            console.log(`User ${email} not found.`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

makeSuperAdmin();
