// File: scripts/seedHousehold.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Household = require('../models/household');
const Resident = require('../models/residents');

dotenv.config();

const seedHousehold = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        // --- 1. Dữ liệu mẫu Nhân khẩu (Resident) ---
        // Ta cần tạo Resident trước để có ObjectId liên kết
        console.log('Creating sample residents...');

        // Tạo chủ hộ mẫu
        const owner1 = new Resident({
            fullName: 'Trần Văn Chủ',
            idNumber: '123456789012',
            relationToOwner: 'Chủ hộ',
        });
        const member1 = new Resident({
            fullName: 'Lê Thị Vợ',
            idNumber: '987654321098',
            relationToOwner: 'Vợ/Chồng',
        });

        const savedOwner1 = await owner1.save();
        const savedMember1 = await member1.save();

        // --- 2. Dữ liệu mẫu Hộ khẩu (Household) ---
        
        // Hộ khẩu 101 (có 2 thành viên)
        const household1 = new Household({
            apartmentNumber: '101',
            area: 75.5,
            ownerName: savedOwner1.fullName,
            status: 'active',
            members: [savedOwner1._id, savedMember1._id], // Liên kết với Resident
        });

        // Hộ khẩu 202 (chỉ có Chủ hộ)
        const household2 = new Household({
            apartmentNumber: '202',
            area: 60.0,
            ownerName: 'Nguyễn Văn Độc',
            status: 'active',
            members: [], 
        });

        // Xóa dữ liệu Hộ khẩu cũ để tránh trùng lặp
        await Household.deleteMany({});
        await Resident.deleteMany({ idNumber: { $in: ['123456789012', '987654321098'] } });
        
        await household1.save();
        await household2.save();

        console.log('✓ Sample households created successfully!');
        console.log(`  Household 101 (Area: ${household1.area}m2) created.`);
        console.log(`  Household 202 (Area: ${household2.area}m2) created.`);

        await mongoose.connection.close();
        console.log('✓ Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error seeding households:', error.message);
        process.exit(1);
    }
};

seedHousehold();