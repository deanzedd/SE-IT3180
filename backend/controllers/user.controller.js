// # UC011-UC013: CRUD Tài khoản cán bộ
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc      Get all users
// @route     GET /api/users
// @access    Private (Admin only)
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const filter = {};
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter).select('-password').skip(skip).limit(limit);
        
        res.status(200).json({
            data: users,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
    }
};

// @desc      Get user by ID
// @route     GET /api/users/:id
// @access    Private (Admin only)
const getUserById = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Định dạng ID người dùng không hợp lệ' });
    }

    try {
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error: error.message });
    }
};

// @desc      Create new user (Add staff account)
// @route     POST /api/users
// @access    Private (Admin only)
// @note      UC011: Thêm tài khoản cán bộ
const createUser = async (req, res) => {
    const { username, password, fullName, role, email, phone, status } = req.body;

    // Validation
    if (!username || !password || !fullName || !role) {
        return res.status(400).json({
            message: 'Vui lòng điền đầy đủ các trường bắt buộc: tên đăng nhập, mật khẩu, họ tên, vai trò'
        });
    }

    // Validate role
    if (!['admin', 'manager', 'accountant'].includes(role)) {
        return res.status(400).json({
            message: 'Vai trò không hợp lệ. Phải là "admin", "manager", hoặc "accountant"'
        });
    }

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: `Tên đăng nhập "${username}" đã tồn tại` });
        }

        // Create new user
        const user = new User({
            username,
            password, // Will be hashed by the pre-save hook
            fullName,
            role,
            email,
            phone,
            status
        });

        const createdUser = await user.save();

        // Return user data without password
        const userResponse = {
            _id: createdUser._id,
            username: createdUser.username,
            fullName: createdUser.fullName,
            email: createdUser.email,
            phone: createdUser.phone,
            status: createdUser.status,
            role: createdUser.role,
            createdAt: createdUser.createdAt,
            updatedAt: createdUser.updatedAt
        };

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi tạo người dùng', error: error.message });
    }
};

// @desc      Update existing user (Modify staff account)
// @route     PUT /api/users/:id
// @access    Private (Admin only)
// @note      UC012: Sửa thông tin tài khoản cán bộ
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullName, role, password, email, phone, status } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Định dạng ID người dùng không hợp lệ' });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Update fields if provided
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (status) user.status = status;
        if (role) {
            // Validate role
            if (!['admin', 'manager', 'accountant'].includes(role)) {
                return res.status(400).json({
                    message: 'Vai trò không hợp lệ. Phải là "admin", "manager", hoặc "accountant"'
                });
            }
            user.role = role;
        }
        if (password) user.password = password; // Will be hashed by pre-save hook

        const updatedUser = await user.save();

        // Return user data without password
        const userResponse = {
            _id: updatedUser._id,
            username: updatedUser.username,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            status: updatedUser.status,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };

        res.status(200).json(userResponse);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi cập nhật người dùng', error: error.message });
    }
};

// @desc      Delete user (Remove staff account)
// @route     DELETE /api/users/:id
// @access    Private (Admin only)
// @note      UC013: Xóa tài khoản cán bộ
const deleteUser = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Định dạng ID người dùng không hợp lệ' });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Prevent deletion of the last admin user (optional check)
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount === 1) {
                return res.status(400).json({
                    message: 'Không thể xóa quản trị viên cuối cùng. Phải có ít nhất một quản trị viên.'
                });
            }
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Đã xóa người dùng thành công',
            deletedUser: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                email: user.email,
                phone: user.phone,
                status: user.status
            }
        });
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi xóa người dùng', error: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
