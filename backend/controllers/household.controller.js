const Household = require('../models/household');
const Resident = require('../models/resident');
// @desc    Get all households
// @route   GET /api/households
//PHIÊN BẢN ĐẦU: GỌI TẤT CẢ CÁC HOUSEHOLD CÙNG VỚI MEMBER
//DỰ KIẾN: KHI LOAD TRANG KHÔNG CẦN GỌI MEMBER, MÀ SẼ GỌI KHI BẤM NÚT CHI TIẾT
const getHouseholds = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const isDeleted = req.query.isDeleted === 'true' || req.query.isDeleted === true;
        const filter = isDeleted ? { isDeleted: true } : { isDeleted: { $ne: true } };

        if (search) {
            filter.apartmentNumber = { $regex: search, $options: 'i' };
        }

        const total = await Household.countDocuments(filter);
        // Populate members để lấy thông tin chi tiết nhân khẩu
        const households = await Household.find(filter)
            .populate('members')
            .sort({ apartmentNumber: 1 })
            .skip(skip)
            .limit(limit);
        
        // Map qua từng hộ để tìm chủ hộ và thêm trường ownerName
        const data = households.map(h => {
            const householdObj = h.toObject();
            // Tìm thành viên là chủ hộ
            const owner = (h.members || []).find(m => m.relationToOwner === 'owner');
            
            return {
                ...householdObj,
                ownerName: owner ? owner.fullName : 'Chưa có'
            };
        });

        res.status(200).json({
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new household
// @route   POST /api/households
const createHousehold = async (req, res) => {
    const { apartmentNumber, area, motorbikeNumber, carNumber } = req.body;
    try {
        // Validate required fields
        if (!apartmentNumber || !area) {
            return res.status(400).json({ message: "Vui lòng nhập số căn hộ và diện tích" });
        }

        const household = new Household({ apartmentNumber, area, motorbikeNumber, carNumber });
        const createdHousehold = await household.save();
        res.status(201).json(createdHousehold);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a household
// @route   DELETE /api/households/:id
const deleteHousehold = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Kiểm tra hộ khẩu tồn tại
        const household = await Household.findById(id);
        if (!household) {
            return res.status(404).json({ message: "Không tìm thấy hộ khẩu" });
        }

        // 2. Kiểm tra xem có nhân khẩu nào đang thuộc hộ này không
        const residentCount = await Resident.countDocuments({ household: id });
        if (residentCount > 0) {
            return res.status(400).json({ message: "Không thể xóa hộ khẩu đang có thành viên cư trú." });
        }

        // 3. Thực hiện xóa
        await Household.findByIdAndUpdate(id, { isDeleted: true });

        res.status(200).json({ 
            message: "Đã xóa hộ khẩu thành công",
            deletedHousehold: household 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a household
// @route   PUT /api/households/:id
const updateHousehold = async (req, res) => {
    try {
        // Prevent manual status update
        const { status, ...updateData } = req.body;

        // 1. Tìm và cập nhật hộ khẩu bằng findByIdAndUpdate
        // { new: true }: Trả về object sau khi đã cập nhật thay vì object cũ
        // { runValidators: true }: Đảm bảo dữ liệu mới vẫn tuân thủ Schema (vd: required, enum)
        const updatedHousehold = await Household.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        // 2. Kiểm tra nếu không tìm thấy hộ khẩu với ID cung cấp
        if (!updatedHousehold) {
            return res.status(404).json({ message: "Không tìm thấy hộ khẩu để cập nhật" });
        }

        // 3. Trả về dữ liệu đã cập nhật thành công (Status 200)
        res.status(200).json(updatedHousehold);
        
    } catch (error) {
        // 4. Xử lý lỗi (ví dụ: lỗi định dạng ID hoặc lỗi từ Database)
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getHouseholds, createHousehold, deleteHousehold, updateHousehold };