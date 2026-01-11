const Fee = require('../models/fee');
const PaymentSession = require('../models/paymentSession');
const mongoose = require('mongoose');

// @desc      Get all fees
// @route     GET /api/fees
// @access    Private
const getFees = async (req, res) => {
    try {
        const isDeleted = req.query.isDeleted === 'true' || req.query.isDeleted === true;
        const filter = isDeleted ? { isDeleted: true } : { isDeleted: { $ne: true } };
        const fees = await Fee.find(filter).sort({ createdAt: -1 });
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách khoản thu', error: error.message });
    }
};

// @desc      Create new fee
// @route     POST /api/fees
// @access    Private (Admin/Manager role typically)
const createFee = async (req, res) => {
    const { name, type, unitPrice, unit, description } = req.body;

    try {
        // Check if a fee with the same name already exists
        const existingFee = await Fee.findOne({ name, isDeleted: { $ne: true } });
        if (existingFee) {
            return res.status(400).json({ message: 'Khoản thu với tên này đã tồn tại.' });
        }

        const fee = new Fee({
            name,
            type,
            unitPrice,
            unit,
            description
        });

        const createdFee = await fee.save();
        res.status(201).json(createdFee);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi tạo khoản thu', error: error.message });
    }
};

// @desc      Update existing fee
// @route     PUT /api/fees/:id
// @access    Private (Admin/Manager role typically)
const editFee = async (req, res) => {
    const { id } = req.params;
    // Lấy dữ liệu từ body
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Định dạng ID khoản thu không hợp lệ' });
    }

    try {
        // Sử dụng findByIdAndUpdate để ghi đè dữ liệu hiệu quả hơn
        const updatedFee = await Fee.findByIdAndUpdate(
            id, 
            { $set: updateData }, // Sử dụng $set để cập nhật chính xác các trường gửi lên
            { new: true, runValidators: true }
        );

        if (!updatedFee) {
            return res.status(404).json({ message: 'Không tìm thấy khoản thu' });
        }

        res.status(200).json(updatedFee);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi cập nhật khoản thu', error: error.message });
    }
};

// @desc      Delete a fee
// @route     DELETE /api/fees/:id
// @access    Private (Admin/Manager role typically)
const deleteFee = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Định dạng ID khoản thu không hợp lệ' });
    }

    try {
        const fee = await Fee.findById(id);

        if (fee) {
            // Check if fee is used in any active PaymentSession
            const activeSession = await PaymentSession.findOne({ 'fees.fee': id, isActive: true });
            if (activeSession) {
                return res.status(400).json({ 
                    message: `Không thể xóa khoản thu này vì đang được sử dụng trong đợt thu: ${activeSession.title}` 
                });
            }

            await Fee.findByIdAndUpdate(id, { isDeleted: true });
            res.status(200).json({ message: 'Đã xóa khoản thu thành công' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy khoản thu' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa khoản thu', error: error.message });
    }
};

module.exports = {
    getFees,
    createFee,
    editFee,
    deleteFee
};