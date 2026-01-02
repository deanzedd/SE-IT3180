/**
 * Database Cleaning Script
 * Usage:
 *   node scripts/cleanData.js              (Clean ALL collections)
 *   node scripts/cleanData.js --users      (Only clean Users)
 *   node scripts/cleanData.js --households (Clean Households and Residents)
 *   node scripts/cleanData.js --fees       (Clean Fees)
 *   node scripts/cleanData.js --sessions   (Clean all payment-related data)
 *   node scripts/cleanData.js --changes    (Clean Residence Changes)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Import Models
const User = require('../models/User');
const Household = require('../models/household');
const Resident = require('../models/resident');
const Fee = require('../models/fee');
const PaymentSession = require('../models/paymentSession');
const HouseholdPaymentDetail = require('../models/householdPaymentDetail');
const Transaction = require('../models/transaction');
const Invoice = require('../models/invoice');
const ResidenceChange = require('../models/residenceChange');

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');
    } catch (error) {
        console.error('✗ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

const cleanData = async () => {
    const args = process.argv.slice(2);
    const cleanAll = args.length === 0;

    const operations = [];
    let cleanedSomething = false;

    if (cleanAll || args.includes('--users')) {
        console.log('🧹 Cleaning Users...');
        operations.push(User.deleteMany({}));
        cleanedSomething = true;
    }
    if (cleanAll || args.includes('--households')) {
        console.log('🧹 Cleaning Households & Residents...');
        operations.push(Household.deleteMany({}));
        operations.push(Resident.deleteMany({}));
        cleanedSomething = true;
    }
    if (cleanAll || args.includes('--fees')) {
        console.log('🧹 Cleaning Fees...');
        operations.push(Fee.deleteMany({}));
        cleanedSomething = true;
    }
    if (cleanAll || args.includes('--sessions')) {
        console.log('🧹 Cleaning Payment Sessions, Details, Transactions, Invoices...');
        operations.push(PaymentSession.deleteMany({}));
        operations.push(HouseholdPaymentDetail.deleteMany({}));
        operations.push(Transaction.deleteMany({}));
        operations.push(Invoice.deleteMany({}));
        cleanedSomething = true;
    }
    if (cleanAll || args.includes('--changes')) {
        console.log('🧹 Cleaning Residence Changes...');
        operations.push(ResidenceChange.deleteMany({}));
        cleanedSomething = true;
    }

    if (cleanedSomething) {
        await Promise.all(operations);
        console.log('\n✓ Database cleaning completed successfully.');
    } else {
        console.log('No specific collection to clean. Use tags like --users, --households, etc., or no arguments to clean all.');
    }
};

const runClean = async () => {
    await connectDB();
    try {
        await cleanData();
    } catch (error) {
        console.error('✗ An error occurred during cleaning:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✓ Connection closed');
        process.exit(0);
    }
};

runClean();