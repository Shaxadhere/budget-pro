import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const companySchema = new Schema({
    companyName: { type: String, required: true },
    companyTagline: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactWebsite: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

companySchema.plugin(mongooseAggregatePaginate);
const Company = model('Company', companySchema);
export default Company;
