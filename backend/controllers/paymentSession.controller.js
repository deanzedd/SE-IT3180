const PaymentSession = require('../models/paymentSession');
const Fee = require('../models/fee');
const mongoose = require('mongoose');

// Helper function to check for valid ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- PAYMENT SESSION (Đợt thu - UC006, UC007) ---

// @desc      Get all payment sessions
// @route     GET /api/payments/sessions
// @access    Private
const getPaymentSessions = async (req, res) => {
    try {
        // Populate fees to see which specific Fee model is referenced
        const sessions = await PaymentSession.find({})
            .populate({
                path: 'fees.fee', // Đi sâu vào mảng 'fees', populate trường 'fee'
                select: 'name type unit' // Chỉ lấy các trường cần thiết từ Fee Model
            })
            .sort({ startDate: -1 }); // Sắp xếp theo ngày gần nhất

        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment sessions', error: error.message });
    }
};

// @desc      Create new payment session
// @route     POST /api/paymentSession
// @access    Private
const createPaymentSession = async (req, res) => {
    const { title, description, startDate, endDate, fees } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title is required to create a payment session.' });
    }

    try {
        const session = new PaymentSession({
            title,
            description,
            startDate,
            endDate,
            fees,
            createdBy: req.user._id // Gán ID của người dùng đang đăng nhập (từ req.user được gán bởi middleware protect)
        });

        const createdSession = await session.save();
        res.status(201).json(createdSession);
    } catch (error) {
        res.status(400).json({ message: 'Error creating payment session', error: error.message });
    }
};

// @desc      Update payment session
// @route     PUT /api/payments/sessions/:id
// @access    Private
const editPaymentSession = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Invalid Session ID format' });
    }

    try {
        const updatedSession = await PaymentSession.findByIdAndUpdate(
            id,
            req.body, // Cập nhật tất cả các trường được gửi trong body
            { new: true, runValidators: true } // Trả về bản ghi mới và chạy validator
        ).populate({
            path: 'fees.fee',
            select: 'name type unit'
        });

        if (!updatedSession) {
            return res.status(404).json({ message: 'Payment Session not found' });
        }

        res.status(200).json(updatedSession);
    } catch (error) {
        res.status(400).json({ message: 'Error updating payment session', error: error.message });
    }
};

// @desc      Delete payment session
// @route     DELETE /api/payments/sessions/:id
// @access    Private
const deletePaymentSession = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Invalid Session ID format' });
    }

    try {
        // WARNING: Cần kiểm tra xem có Transaction nào liên kết với Session này không trước khi xóa
        // Nếu có, phải ngăn chặn xóa hoặc xử lý xóa mềm (soft delete).
        const result = await PaymentSession.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Payment Session not found' });
        }

        res.status(200).json({ message: 'Payment Session successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting payment session', error: error.message });
    }
};



module.exports = {
    getPaymentSessions,
    createPaymentSession,
    editPaymentSession,
    deletePaymentSession
};