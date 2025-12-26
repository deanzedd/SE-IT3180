const express = require('express');
const router = express.Router();

const { 
    createResident,
    updateResident,
    getResidents,
    deleteResident} = require('../controllers/resident.controller');

const { protect } = require('../middleware/auth.middleware');

// Thêm middleware 'protect' nếu muốn yêu cầu đăng nhập mới được gọi
router.route('/')
    .get(protect, getResidents)
    .post(protect, createResident)

router.route('/:id')
    .delete(protect, deleteResident)
    .put(protect, updateResident)
module.exports = router;