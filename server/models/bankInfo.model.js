import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const bankInfoSchema = new Schema({
    bankName: { type: String, required: true },
    accountTitle: { type: String, required: true }, // Changed from accountName to match invoice schema
    accountNumber: { type: String, required: true },
    currency: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

bankInfoSchema.plugin(mongooseAggregatePaginate);
const BankInfo = model('BankInfo', bankInfoSchema);
export default BankInfo;
