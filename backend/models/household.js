// # Model Hộ khẩu (Số nhà, diện tích, chủ hộ)
const mongoose = require('mongoose');

const householdSchema = mongoose.Schema({
    apartmentNumber: { type: String, required: true }, // Số phòng
    area: { type: Number, required: true }, // Diện tích (m2)
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resident'
    }],
    motorbikeNumber: { type: Number, default: 0 }, // Số xe máy
    carNumber: { type: Number, default: 0 }, // Số ô tô
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Partial Index: Chỉ bắt lỗi trùng số phòng với những hộ chưa bị xóa (isDeleted != true)
householdSchema.index(
    { apartmentNumber: 1 }, 
    { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);

module.exports = mongoose.model('Household', householdSchema);