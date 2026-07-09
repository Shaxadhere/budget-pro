import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const incomeInstallmentSchema = new Schema({
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    receivedDate: { type: Date }
}, { timestamps: true });

// Per-month actual income log — tracks what was actually received vs estimated
const monthlyLogSchema = new Schema({
    date: { type: Date, required: true },          // actual payment date
    month: { type: Number, min: 1, max: 12 },      // derived from date
    year:  { type: Number },                       // derived from date
    receivedAmount: { type: Number, required: true },
    deductions: { type: Number, default: 0 },
    deductionNotes: { type: String },
    netAmount: { type: Number },
    notes: { type: String },
    status: { type: String, enum: ['pending', 'received'], default: 'received' }
}, { timestamps: true });

const incomeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    source: { type: String, required: true },

    amount: { type: Number, required: true }, // estimated monthly income
    currency: {
        type: String,
        default: 'PKR',
        enum: ['PKR','USD','EUR','GBP','AED','AUD','CAD','SAR','INR','CNY','JPY','CHF','SGD','MYR','TRY']
    },

    type: {
        type: String,
        required: true,
        enum: ['permanent', 'retainer', 'contract', 'freelance_one_time', 'freelance_installments']
    },
    frequency: { type: String, enum: ['monthly', 'one-time', 'custom'], default: 'monthly' },
    contractDurationMonths: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    installments: { type: [incomeInstallmentSchema], default: [] },
    monthlyLogs:  { type: [monthlyLogSchema], default: [] },
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
    notes: { type: String }
}, { timestamps: true });

incomeSchema.plugin(mongooseAggregatePaginate);
const Income = model('Income', incomeSchema);
export default Income;
