const Resident = require('../models/resident');
const Household = require('../models/household'); // Import để kiểm tra hộ khẩu tồn tại

// @desc    Lấy danh sách tất cả nhân khẩu (có thể kèm thông tin hộ khẩu)
// @route   GET /api/residents
const getResidents = async (req, res) => {
    try {
        // .populate('household') giúp lấy luôn thông tin chi tiết của hộ khẩu thay vì chỉ trả về ID
        const residents = await Resident.find().populate('household', 'apartmentNumber ownerName');
        res.status(200).json(residents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tạo mới một nhân khẩu
// @route   POST /api/residents
const createResident = async (req, res) => {
    try {
        const { fullName, idNumber, dob, household, gender, relationToOwner, phone  } = req.body;

        // 1. Kiểm tra các trường bắt buộc
        if (!fullName || !idNumber) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ Tên và CCCD" });
        }

        // 2. Kiểm tra xem hộ khẩu có tồn tại không (nếu có truyền household ID)
        if (household) {
            const existingHousehold = await Household.findById(household);
            if (!existingHousehold) {
                return res.status(404).json({ message: "Hộ khẩu không tồn tại" });
            }
        }

        // 3. Tạo nhân khẩu
        const resident = await Resident.create(req.body);
        res.status(201).json(resident);
    } catch (error) {
        // Xử lý lỗi trùng CCCD (nếu bạn đặt unique trong model)
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật thông tin nhân khẩu
// @route   PUT /api/residents/:id
const updateResident = async (req, res) => {
    try {
        const updatedResident = await Resident.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('household', 'apartmentNumber');

        if (!updatedResident) {
            return res.status(404).json({ message: "Không tìm thấy nhân khẩu" });
        }

        res.status(200).json(updatedResident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa một nhân khẩu
// @route   DELETE /api/residents/:id
const deleteResident = async (req, res) => {
    try {
        const resident = await Resident.findByIdAndDelete(req.params.id);

        if (!resident) {
            return res.status(404).json({ message: "Không tìm thấy nhân khẩu để xóa" });
        }

        res.status(200).json({ message: "Đã xóa nhân khẩu thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getResidents,
    createResident,
    updateResident,
    deleteResident
};