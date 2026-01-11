//# Model Khoản thu (Tên, đơn giá, loại phí)
const mongoose = require('mongoose');

const feeSchema = mongoose.Schema({
    name: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['mandatory_automatic', 'mandatory_manual', 'voluntary'], 
        required: true 
    },
    unitPrice: { 
        type: Number, 
        required: function() { return this.type === 'mandatory_automatic'; } 
    },
    unit: { 
        type: String, 
        // THÊM 'm^3', 'electricity', 'default' VÀO ĐÂY
        enum: ['area', 'person', 'household', 'bike', 'car', 'fixed', 'm³', 'kWh', 'default'], 
        required: function() { return this.type !== 'voluntary'; } // Cập nhật lại điều kiện nếu cần
    },
    description: String,
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
