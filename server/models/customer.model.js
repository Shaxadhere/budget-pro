import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const customerSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: [{ type: String, required: true }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

customerSchema.plugin(mongooseAggregatePaginate);
const Customer = model('Customer', customerSchema);
export default Customer;
