import mongoose from 'mongoose';

const monthlyBillSchema = new mongoose.Schema({
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    statementBalance: { type: Number, required: true, default: 0 },
    minimumPayment: { type: Number, required: true, default: 0 },
    actualPaidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['unpaid', 'partially_paid', 'fully_paid'], default: 'unpaid' },
    paymentDate: { type: Date },
    notes: { type: String }
}, { timestamps: true });

const creditCardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardName: { type: String, required: true },
    last4Digits: { type: String },
    currency: { type: String, default: 'PKR' },
    creditLimit: { type: Number, required: true },
    billingCycleDate: { type: Number, required: true, min: 1, max: 31 },
    dueDate: { type: Number, required: true, min: 1, max: 31 },
    notes: { type: String },
    monthlyBills: [monthlyBillSchema]
}, { timestamps: true });

export default mongoose.model('CreditCard', creditCardSchema);
