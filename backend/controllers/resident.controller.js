const Resident = require('../models/resident');
const Household = require('../models/household'); // Import để kiểm tra hộ khẩu tồn tại

// @desc    Lấy danh sách tất cả nhân khẩu (có thể kèm thông tin hộ khẩu)
// @route   GET /api/residents
const getResidents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const isDeleted = req.query.isDeleted === 'true' || req.query.isDeleted === true;
        const filter = isDeleted ? { isDeleted: true } : { isDeleted: { $ne: true } };

        if (search) {
            // Tìm các hộ khẩu có số phòng khớp với từ khóa tìm kiếm
            const matchingHouseholds = await Household.find({ 
                apartmentNumber: { $regex: search, $options: 'i' } 
            }).select('_id');
            const householdIds = matchingHouseholds.map(h => h._id);

            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { idNumber: { $regex: search, $options: 'i' } },
                { household: { $in: householdIds } }
            ];
        }

        const total = await Resident.countDocuments(filter);
        // .populate('household') giúp lấy luôn thông tin chi tiết của hộ khẩu thay vì chỉ trả về ID
        const residents = await Resident.find(filter)
            .populate('household', 'apartmentNumber area')
            .skip(skip)
            .limit(limit);
            
        res.status(200).json({
            data: residents,
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

// @desc    Tạo mới một nhân khẩu
// @route   POST /api/residents
const createResident = async (req, res) => {
    try {
        const { fullName, idNumber, dob, household, gender, relationToOwner, phone  } = req.body;

        // 1. Kiểm tra các trường bắt buộc
        if (!fullName || !idNumber) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ Tên và CCCD" });
        }

        // 2. Kiểm tra hộ khẩu bắt buộc
        if (!household) {
            return res.status(400).json({ message: "Vui lòng chọn hộ khẩu" });
        }

        // 3. Kiểm tra relationToOwner bắt buộc
        if (!relationToOwner) {
            return res.status(400).json({ message: "Vui lòng chọn mối quan hệ với chủ hộ" });
        }

        // 4. Kiểm tra xem hộ khẩu có tồn tại không
        const existingHousehold = await Household.findById(household);
        if (!existingHousehold) {
            return res.status(404).json({ message: "Hộ khẩu không tồn tại" });
        }

        // 5. Nếu là chủ hộ (owner), kiểm tra chưa có owner nào cho hộ khẩu này
        if (relationToOwner === 'owner') {
            const existingOwner = await Resident.findOne({
                household: household,
                relationToOwner: 'owner',
                isDeleted: { $ne: true }
            });
            if (existingOwner) {
                return res.status(400).json({ message: "Hộ khẩu này đã có chủ hộ rồi" });
            }
        }

        // 6. Tạo nhân khẩu
        const resident = await Resident.create(req.body);

        // 7. Thêm resident vào danh sách members của household
        await Household.findByIdAndUpdate(
            household,
            { 
                $push: { members: resident._id },
                status: 'active' 
            },
            { new: true }
        );

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
        const residentId = req.params.id;
        const updates = req.body;

        // 1. Lấy thông tin hiện tại để so sánh
        const currentResident = await Resident.findById(residentId);
        if (!currentResident) {
            return res.status(404).json({ message: "Không tìm thấy nhân khẩu" });
        }

        // 2. Kiểm tra trùng chủ hộ nếu có thay đổi quan hệ hoặc chuyển hộ
        if (updates.relationToOwner === 'owner') {
            const targetHousehold = updates.household || currentResident.household;
            const existingOwner = await Resident.findOne({
                household: targetHousehold,
                relationToOwner: 'owner',
                _id: { $ne: residentId },
                isDeleted: { $ne: true }
            });
            if (existingOwner) {
                return res.status(400).json({ message: "Hộ khẩu này đã có chủ hộ rồi" });
            }
        }

        const updatedResident = await Resident.findByIdAndUpdate(
            residentId,
            updates,
            { new: true, runValidators: true }
        ).populate('household', 'apartmentNumber');

        // 3. Xử lý chuyển hộ khẩu (Cập nhật danh sách thành viên)
        const oldHouseholdId = currentResident.household?.toString();
        const newHouseholdId = updates.household;

        if (newHouseholdId && oldHouseholdId !== newHouseholdId) {
            // Rút khỏi hộ cũ
            if (oldHouseholdId) {
                const oldHh = await Household.findByIdAndUpdate(oldHouseholdId, { $pull: { members: residentId } }, { new: true });
                if (oldHh && oldHh.members.length === 0) await Household.findByIdAndUpdate(oldHouseholdId, { status: 'inactive' });
            }
            // Thêm vào hộ mới
            await Household.findByIdAndUpdate(newHouseholdId, { $addToSet: { members: residentId }, status: 'active' });
        }

        // 4. Xử lý khôi phục (Restore)
        if (updates.isDeleted === false && currentResident.isDeleted) {
            if (updatedResident.household) {
                await Household.findByIdAndUpdate(
                    updatedResident.household,
                    { 
                        $addToSet: { members: residentId },
                        status: 'active'
                    }
                );
            }
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
        const resident = await Resident.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );

        if (!resident) {
            return res.status(404).json({ message: "Không tìm thấy nhân khẩu để xóa" });
        }

        // Cập nhật hộ khẩu: Xóa thành viên và kiểm tra active/inactive
        if (resident.household) {
            const household = await Household.findByIdAndUpdate(
                resident.household,
                { $pull: { members: resident._id } },
                { new: true }
            );
            if (household && household.members.length === 0) {
                await Household.findByIdAndUpdate(resident.household, { status: 'inactive' });
            }
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