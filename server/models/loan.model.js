import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const loanPaymentSchema = new Schema({
    amount: { type: Number, required: true },
    transactionType: { type: String, enum: ['repayment', 'gave', 'received'], default: 'repayment' },
    paymentDate: { type: Date, default: Date.now },
    note: { type: String }
}, { timestamps: true });

const loanSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    type: { type: String, required: true, enum: ['taken', 'given', 'ledger'] },
    lenderOrBorrowerName: { type: String, required: true },
    amount: { type: Number, default: 0 },
    interestRate: { type: Number, default: 0 },
    totalAmountDue: { type: Number, default: 0 },
    totalAmountPaid: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    emiAmount: { type: Number },
    frequency: { type: String, enum: ['monthly', 'weekly', 'one-time', 'custom'], default: 'monthly' },
    status: { type: String, enum: ['active', 'paid', 'overdue', 'settled'], default: 'active' },
    payments: { type: [loanPaymentSchema], default: [] },
    notes: { type: String }
}, { timestamps: true });

loanSchema.plugin(mongooseAggregatePaginate);
const Loan = model('Loan', loanSchema);
export default Loan;
