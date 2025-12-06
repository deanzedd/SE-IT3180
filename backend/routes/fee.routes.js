const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getFees, createFee, editFee, deleteFee } = require('../controllers/fee.controller');

// Route cho các thao tác Lấy danh sách (GET) và Tạo mới (POST)
// Endpoint: /api/fees
router.route('/')
    .get(protect, getFees)    // Lấy tất cả Khoản thu
    .post(protect, createFee); // Tạo Khoản thu mới

// Route cho các thao tác Sửa (PUT) và Xóa (DELETE) theo ID
// Endpoint: /api/fees/:id
router.route('/:id')
    .put(protect, editFee)    // Sửa Khoản thu theo ID
    .delete(protect, deleteFee); // Xóa Khoản thu theo ID

module.exports = router;