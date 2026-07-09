import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Per-month actual bill entry — used when isVariableAmount is true
const monthlyActualSchema = new Schema({
    month: { type: Number, required: true, min: 1, max: 12 },
    year:  { type: Number, required: true },
    actualAmount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    paymentDate: { type: Date },
    notes: { type: String }
}, { timestamps: true });

const expenseSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },

    // Fixed amount (used when isVariableAmount === false)
    amount: { type: Number, required: true },

    // Variable amount support
    isVariableAmount: { type: Boolean, default: false },
    estimatedAmount: { type: Number }, // budgeted/expected (e.g. ~20,000 for electricity)
    monthlyActuals: { type: [monthlyActualSchema], default: [] },

    dueDate: { type: Date, required: true },
    isRecurring: { type: Boolean, default: false },
    recurringPeriod: { type: String, enum: ['monthly', 'yearly', 'weekly', 'one-time'], default: 'one-time' },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    paymentDate: { type: Date },
    notes: { type: String }
}, { timestamps: true });

expenseSchema.plugin(mongooseAggregatePaginate);
const Expense = model('Expense', expenseSchema);
export default Expense;

