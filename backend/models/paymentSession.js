// # Model Đợt thu / Payment Session
const mongoose = require('mongoose');

const paymentSessionSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    fees: [
        {
            fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
            unitPrice: { type: Number }, // optional override of Fee.unitPrice
            note: { type: String }
        }
    ],
    totalExpectedMandatory: { type: Number, default: 0 },
    totalPaidMandatory: { type: Number, default: 0 },
    totalVoluntaryCollected: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PaymentSession', paymentSessionSchema);