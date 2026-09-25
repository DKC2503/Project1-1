require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const TARGET_EMAILS = [
    'newsprecent57@gmail.com',
    'karthikdaraworks@gmail.com'
];

async function migrate() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('ERROR: MONGODB_URI missing.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        for (const email of TARGET_EMAILS) {
            const user = await User.findOne({ email });
            if (!user) {
                console.log(`User ${email} not found.`);
                continue;
            }

            if (user.role === 'admin' || user.role === 'MAINTENANCE' || user.role === 'ADMIN') {
                user.role = 'MAINTENANCE';
                await user.save();
                console.log(`Successfully migrated ${email} to MAINTENANCE role.`);
            } else {
                console.log(`User ${email} has unexpected role: ${user.role}. Skipping.`);
            }
        }
        
        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        mongoose.connection.close();
    }
}

migrate();
