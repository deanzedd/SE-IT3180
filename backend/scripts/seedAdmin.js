/**
 * Seed script to create an admin user in MongoDB
 * Run: node scripts/seedAdmin.js
 * This script uses the User model's pre-save hook to hash the password automatically.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('⚠ Admin user already exists. Deleting old user...');
            await User.deleteOne({ username: 'admin' });
            console.log('✓ Old admin deleted');
        }

        // Create new admin user
        const adminUser = new User({
            username: 'admin',
            password: 'Admin123!', // Will be hashed by the pre-save hook
            fullName: 'Quản Trị Viên',
            role: 'admin'
        });

        const savedUser = await adminUser.save();
        console.log('✓ Admin user created successfully!');
        console.log(`  Username: ${savedUser.username}`);
        console.log(`  Full Name: ${savedUser.fullName}`);
        console.log(`  Role: ${savedUser.role}`);
        console.log(`  ID: ${savedUser._id}`);

        await mongoose.connection.close();
        console.log('✓ Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
