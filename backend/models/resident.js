// # Model Nhân khẩu (Thông tin cá nhân, CCCD)
const mongoose = require('mongoose');

const residentSchema = mongoose.Schema({
	fullName: { type: String, required: true },
	idNumber: { type: String, required: true }, // CCCD/ID
	dob: { type: Date },
	gender: { type: String, enum: ['male', 'female', 'other'] },
	relationToOwner: { type: String }, // Ví dụ: chủ hộ, vợ/chồng, con
	phone: { type: String },
	email: { type: String },
	status: { type: String, enum: ['active', 'inactive'], default: 'active' },
	household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' }
}, { timestamps: true });

module.exports = mongoose.model('Resident', residentSchema);
