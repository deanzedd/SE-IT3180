/**
 * Unified Seed Script
 * Usage: 
 *   node scripts/seedData.js              (Seed all data without cleaning)
 *   node scripts/seedData.js --users      (Only seed users)
 *   node scripts/seedData.js --households (Seed households & residents)
 *   node scripts/seedData.js --fees       (Seed fees)
 *   node scripts/seedData.js --sessions   (Seed payment sessions & details & transactions)
 *   node scripts/seedData.js --clean      (Clean DB before seeding, recommended for first run)
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

// Load .env from backend root (one level up from scripts) regardless of where the script is run from
dotenv.config({ path: path.join(__dirname, '../.env') });

const args = process.argv.slice(2);
const shouldClean = args.includes('--clean');
const seedAll = args.length === 0 || (args.length === 1 && shouldClean);

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
    console.log('🧹 Cleaning database...');
    await Promise.all([
        User.deleteMany({}),
        Household.deleteMany({}),
        Resident.deleteMany({}),
        Fee.deleteMany({}),
        PaymentSession.deleteMany({}),
        HouseholdPaymentDetail.deleteMany({}),
        Transaction.deleteMany({}),
        Invoice.deleteMany({}),
        ResidenceChange.deleteMany({})
    ]);
    console.log('✓ Database cleaned');
};

// --- 1. SEED USERS ---
const seedUsers = async () => {
    console.log('👤 Seeding Users...');
    const users = [
        { username: 'admin', password: 'Admin123!', fullName: 'Quản Trị Viên', role: 'admin' },
        { username: 'manager', password: 'Manager123!', fullName: 'Cán Bộ Quản Lý', role: 'manager' },
        { username: 'accountant', password: 'Accountant123!', fullName: 'Kế Toán Viên', role: 'accountant' },
        { username: 'accountant02', password: 'Accountant123!', fullName: 'Kế Toán Đi Tù', role: 'accountant', status: 'Tạm khóa' }
    ];

    for (const u of users) {
        const exists = await User.findOne({ username: u.username });
        if (!exists) {
            await User.create(u);
        }
    }
    console.log(`✓ Created ${users.length} users`);
};

// --- 2. SEED FEES ---
const seedFees = async () => {
    console.log('💰 Seeding Fees...');
    const fees = [
        { name: 'Phí dịch vụ chung cư', type: 'mandatory_automatic', unit: 'area', unitPrice: 10000, description: '10k/m2' },
        { name: 'Phí quản lý chung cư', type: 'mandatory_automatic', unit: 'area', unitPrice: 7000, description: '7k/m2' },
        { name: 'Phí gửi xe máy', type: 'mandatory_automatic', unit: 'bike', unitPrice: 70000, description: '70k/xe' },
        { name: 'Phí gửi ô tô', type: 'mandatory_automatic', unit: 'car', unitPrice: 1200000, description: '1.2tr/xe' },
        { name: 'Tiền điện', type: 'mandatory_manual', unit: 'electricity', unitPrice: 3500, description: 'Theo số công tơ' },
        { name: 'Tiền nước', type: 'mandatory_manual', unit: 'm^3', unitPrice: 15000, description: 'Theo khối' },
        { name: 'Quỹ Nuôi em', type: 'voluntary', unit: 'default', unitPrice: 0, description: 'Tự nguyện' }
    ];

    // Xóa cũ tạo mới để đảm bảo ID đồng bộ cho các bước sau
    await Fee.deleteMany({});
    const createdFees = await Fee.insertMany(fees);
    console.log(`✓ Created ${createdFees.length} fees`);
    return createdFees;
};

// --- 3. SEED HOUSEHOLDS & RESIDENTS ---
const seedHouseholdsAndResidents = async () => {
    console.log('🏠 Seeding Households & Residents...');
    
    // Xóa dữ liệu cũ
    await Household.deleteMany({});
    await Resident.deleteMany({});

    const sampleData = [
        {
            apt: '101', area: 80, bikes: 2, cars: 0,
            residents: [
                { name: 'Nguyễn Văn A', idCard: '001088000001', relation: 'owner', gender: 'male', dob: '1980-01-01' },
                { name: 'Trần Thị B', idCard: '001088000002', relation: 'spouse', gender: 'female', dob: '1982-05-05' }
            ]
        },
        {
            apt: '102', area: 100, bikes: 1, cars: 1,
            residents: [
                { name: 'Lê Văn C', idCard: '001088000003', relation: 'owner', gender: 'male', dob: '1975-10-10' },
                { name: 'Phạm Thị D', idCard: '001088000004', relation: 'spouse', gender: 'female', dob: '1978-12-12' },
                { name: 'Lê Văn E', idCard: '001088000005', relation: 'child', gender: 'male', dob: '2005-01-01' }
            ]
        },
        {
            apt: '201', area: 65, bikes: 1, cars: 0,
            residents: [
                { name: 'Hoàng Thị F', idCard: '001088000006', relation: 'owner', gender: 'female', dob: '1990-03-08' },
                { name: 'Nguyễn Văn G', idCard: '001088000007', relation: 'child', gender: 'male', dob: '2005-08-30' },
                { name: 'Trần Văn H', idCard: '001088000008', relation: 'renter', gender: 'male', dob: '2005-11-09' }
            ]
        },
        {
            apt: '202', area: 70, bikes: 0, cars: 0, status: 'inactive', // Phòng trống
            residents: []
        }
    ];

    const createdHouseholds = [];

    for (const data of sampleData) {
        // 1. Tạo Hộ khẩu trước (chưa có members)
        const household = await Household.create({
            apartmentNumber: data.apt,
            area: data.area,
            motorbikeNumber: data.bikes,
            carNumber: data.cars,
            status: data.status || 'active'
        });

        const memberIds = [];

        // 2. Tạo Nhân khẩu và link vào Hộ khẩu
        for (const resData of data.residents) {
            const resident = await Resident.create({
                fullName: resData.name,
                idNumber: resData.idCard,
                relationToOwner: resData.relation,
                gender: resData.gender,
                dob: new Date(resData.dob),
                household: household._id,
                status: 'permanent'
            });
            memberIds.push(resident._id);
        }

        // 3. Cập nhật lại mảng members cho Hộ khẩu
        household.members = memberIds;
        await household.save();
        createdHouseholds.push(household);
    }

    console.log(`✓ Created ${createdHouseholds.length} households and residents`);
    return createdHouseholds;
};

// --- 4. SEED SESSIONS & DETAILS & TRANSACTIONS ---
const seedSessionsAndDetails = async (fees, households) => {
    console.log('📅 Seeding Payment Sessions & Details...');

    await PaymentSession.deleteMany({});
    await HouseholdPaymentDetail.deleteMany({});
    await Transaction.deleteMany({});

    // Lấy ID của admin để gán người tạo
    const admin = await User.findOne({ role: 'admin' });

    // Tạo 1 đợt thu mẫu
    const sessionData = {
        title: `Thu phí tháng 1/2026`,
        description: 'Thu phí quản lý, gửi xe và điện nước định kỳ',
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-01-31'),
        createdBy: admin?._id,
        fees: fees.map(f => ({
            fee: f._id,
            unitPrice: f.unitPrice // Giữ nguyên giá gốc
        }))
    };

    const session = await PaymentSession.create(sessionData);

    // --- TẠO CHI TIẾT BẢNG THU (HouseholdPaymentDetail) ---
    // Logic này mô phỏng hàm syncHouseholdPayments trong controller
    const details = [];
    
    for (const hh of households) {
        // Bỏ qua căn hộ trống nếu muốn, hoặc tạo nhưng để trống số liệu
        // Ở đây ta tạo hết

        const items = session.fees.map(sessionFee => {
            const feeDef = fees.find(f => f._id.toString() === sessionFee.fee.toString());
            let quantity = 0;

            // Tự động tính số lượng dựa trên thông tin hộ khẩu
            if (feeDef.type === 'mandatory_automatic') {
                switch (feeDef.unit) {
                    case 'area': quantity = hh.area; break;
                    case 'bike': quantity = hh.motorbikeNumber; break;
                    case 'car': quantity = hh.carNumber; break;
                    default: quantity = 1;
                }
            }
            // Phí thủ công (điện/nước) giả lập số liệu ngẫu nhiên cho các hộ đang ở
            else if (feeDef.type === 'mandatory_manual' && hh.status === 'active') {
                if (feeDef.unit === 'electricity') quantity = Math.floor(Math.random() * 200) + 50; // 50-250 số
                if (feeDef.unit === 'm^3') quantity = Math.floor(Math.random() * 20) + 5; // 5-25 khối
            }

            const totalAmount = quantity * (sessionFee.unitPrice || feeDef.unitPrice);

            return {
                feeInSessionId: sessionFee._id,
                feeRef: feeDef._id,
                feeType: feeDef.type,
                feeName: feeDef.name,
                unit: feeDef.unit,
                unitPrice: sessionFee.unitPrice || feeDef.unitPrice,
                quantity: quantity,
                totalAmount: totalAmount,
                paidAmount: 0,
                isPaid: false
            };
        });

        // Tính tổng bill
        const totalBill = items.reduce((sum, i) => sum + i.totalAmount, 0);

        const detail = await HouseholdPaymentDetail.create({
            paymentSession: session._id,
            household: hh._id,
            items: items,
            totalBill: totalBill,
            totalPaidAmount: 0,
            status: 'unpaid'
        });
        details.push(detail);
    }

    console.log(`✓ Created Payment Session: "${session.title}"`);
    console.log(`✓ Generated Payment Details for ${details.length} households`);

    // --- TẠO GIAO DỊCH MẪU (TRANSACTIONS) ---
    console.log('💸 Seeding Transactions...');
    
    // Giả sử hộ đầu tiên (101) đóng đủ tiền
    const payerDetail = details[0]; // Hộ 101
    if (payerDetail && payerDetail.totalBill > 0) {
        // 1. Tạo Transaction
        await Transaction.create({
            household: payerDetail.household,
            paymentSession: session._id,
            amount: payerDetail.totalBill,
            payerName: 'Nguyễn Văn A',
            method: 'bank',
            note: 'Chuyển khoản VCB',
            status: 'checked',
            createdBy: admin?._id
        });

        // 2. Cập nhật lại HouseholdPaymentDetail (Mô phỏng logic backend)
        payerDetail.items.forEach(item => {
            item.isPaid = true;
            item.paidAmount = item.totalAmount;
        });
        payerDetail.totalPaidAmount = payerDetail.totalBill;
        payerDetail.status = 'paid';
        await payerDetail.save();

        // Cập nhật thống kê Session
        session.totalPaidMandatory += payerDetail.totalBill;
        await session.save();

        console.log(`✓ Created transaction for Household ${payerDetail.household} (Full payment)`);
    }

    // Giả sử hộ thứ hai (102) đóng một phần (ví dụ đóng phí quản lý thôi)
    const partialPayer = details[1]; // Hộ 102
    if (partialPayer) {
        const mgmtFeeItem = partialPayer.items.find(i => i.unit === 'area');
        if (mgmtFeeItem) {
            const amount = mgmtFeeItem.totalAmount;
            
            await Transaction.create({
                household: partialPayer.household,
                paymentSession: session._id,
                amount: amount,
                payerName: 'Lê Văn C',
                method: 'cash',
                note: 'Đóng trước phí quản lý',
                status: 'unchecked', // Chưa duyệt
                createdBy: admin?._id
            });

            // Lưu ý: Vì status là unchecked nên ta chưa update vào PaymentDetail (theo logic nghiệp vụ thông thường)
            // Hoặc nếu hệ thống update ngay thì update ở đây. Giả sử hệ thống update ngay:
            mgmtFeeItem.isPaid = true;
            mgmtFeeItem.paidAmount = amount;
            partialPayer.totalPaidAmount += amount;
            partialPayer.status = 'partially_paid';
            await partialPayer.save();

            session.totalPaidMandatory += amount;
            await session.save();
            
            console.log(`✓ Created partial transaction for Household ${partialPayer.household}`);
        }
    }

    // --- TẠO ĐỢT THU 2: Thu phí tháng 12/2025 (Đã đóng đủ) ---
    const sessionData2 = {
        title: 'Thu phí tháng 12/2025',
        description: 'Thu phí cuối năm, tất cả hộ dân đã hoàn thành nghĩa vụ',
        startDate: new Date('2025-12-10'),
        endDate: new Date('2025-12-31'),
        createdBy: admin?._id,
        fees: fees.map(f => ({
            fee: f._id,
            unitPrice: f.unitPrice
        }))
    };

    const session2 = await PaymentSession.create(sessionData2);
    
    for (const hh of households) {
        const items = session2.fees.map(sessionFee => {
            const feeDef = fees.find(f => f._id.toString() === sessionFee.fee.toString());
            let quantity = 0;

            if (feeDef.type === 'mandatory_automatic') {
                switch (feeDef.unit) {
                    case 'area': quantity = hh.area; break;
                    case 'bike': quantity = hh.motorbikeNumber; break;
                    case 'car': quantity = hh.carNumber; break;
                    default: quantity = 1;
                }
            } else if (feeDef.type === 'mandatory_manual' && hh.status === 'active') {
                if (feeDef.unit === 'electricity') quantity = Math.floor(Math.random() * 200) + 50;
                if (feeDef.unit === 'm^3') quantity = Math.floor(Math.random() * 20) + 5;
            }

            const totalAmount = quantity * (sessionFee.unitPrice || feeDef.unitPrice);

            return {
                feeInSessionId: sessionFee._id,
                feeRef: feeDef._id,
                feeType: feeDef.type,
                feeName: feeDef.name,
                unit: feeDef.unit,
                unitPrice: sessionFee.unitPrice || feeDef.unitPrice,
                quantity: quantity,
                totalAmount: totalAmount,
                paidAmount: totalAmount, // Full paid
                isPaid: true
            };
        });

        const totalBill = items.reduce((sum, i) => sum + i.totalAmount, 0);

        await HouseholdPaymentDetail.create({
            paymentSession: session2._id,
            household: hh._id,
            items: items,
            totalBill: totalBill,
            totalPaidAmount: totalBill,
            status: 'paid'
        });

        if (totalBill > 0) {
            await Transaction.create({
                household: hh._id,
                paymentSession: session2._id,
                amount: totalBill,
                payerName: 'Chủ hộ (Auto)',
                method: 'bank',
                note: 'Thanh toán đủ (Seed)',
                status: 'checked',
                createdBy: admin?._id
            });
            session2.totalPaidMandatory += totalBill;
        }
    }
    await session2.save();
    console.log(`✓ Created Payment Session: "${session2.title}" (All Paid)`);
};

// --- 5. SEED RESIDENCE CHANGES ---
const seedResidenceChanges = async () => {
    console.log('📝 Seeding Residence Changes...');
    
    // 1. Tạm vắng cho Nguyễn Văn G
    const residentG = await Resident.findOne({ fullName: 'Nguyễn Văn G' });
    if (residentG) {
        await ResidenceChange.create({
            resident: residentG._id,
            changeType: 'temporary_absence',
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-07-15'),
            destination: 'KTX Đại học Quốc Gia',
            note: 'Đi học đại học'
        });
        residentG.status = 'temporary_absence';
        await residentG.save();
        console.log(`✓ Created Temporary Absence for ${residentG.fullName}`);
    }

    // 2. Tạm trú cho Trần Văn H
    const residentH = await Resident.findOne({ fullName: 'Trần Văn H' });
    if (residentH) {
        await ResidenceChange.create({
            resident: residentH._id,
            changeType: 'temporary_residence',
            startDate: new Date('2025-02-01'),
            endDate: new Date('2026-02-01'),
            household: residentH.household,
            note: 'Khách thuê nhà dài hạn'
        });
        residentH.status = 'temporary_residence';
        await residentH.save();
        console.log(`✓ Created Temporary Residence for ${residentH.fullName}`);
    }
};

// --- MAIN EXECUTION ---
const runSeed = async () => {
    await connectDB();

    if (shouldClean) {
        await cleanData();
    }

    let fees = [];
    let households = [];

    // 1. Users
    if (seedAll || args.includes('--users')) {
        await seedUsers();
    }

    // 2. Fees
    if (seedAll || args.includes('--fees') || args.includes('--sessions')) {
        fees = await seedFees();
    } else {
        fees = await Fee.find({});
    }

    // 3. Households & Residents
    if (seedAll || args.includes('--households') || args.includes('--sessions')) {
        households = await seedHouseholdsAndResidents();
    } else {
        households = await Household.find({});
    }

    // 4. Sessions (Requires Fees & Households)
    if (seedAll || args.includes('--sessions')) {
        if (fees.length > 0 && households.length > 0) {
            await seedSessionsAndDetails(fees, households);
        } else {
            console.log('⚠ Skipping Sessions: Need Fees and Households data first.');
        }
    }

    // 5. Residence Changes
    if (seedAll || args.includes('--changes')) {
        await seedResidenceChanges();
    }

    console.log('\n🎉 Seeding Completed Successfully!');
    process.exit(0);
};

runSeed();