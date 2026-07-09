import mongoose from "mongoose";
import dotenv from "dotenv";
import Invoice from "../models/invoice.model.js";
import Customer from "../models/customer.model.js";
import Company from "../models/company.model.js";
import BankInfo from "../models/bankInfo.model.js";

dotenv.config();

const verify = async () => {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.DB_CONNECTION);
        console.log("Connected.");

        const invoiceCount = await Invoice.countDocuments();
        const customerCount = await Customer.countDocuments();
        const companyCount = await Company.countDocuments();
        const bankInfoCount = await BankInfo.countDocuments();

        console.log("--- Database Counts ---");
        console.log(`Invoices: ${invoiceCount}`);
        console.log(`Customers: ${customerCount}`);
        console.log(`Companies: ${companyCount}`);
        console.log(`Bank Accounts: ${bankInfoCount}`);

        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
};

verify();
