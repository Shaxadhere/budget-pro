import mongoose from "mongoose";
import dotenv from "dotenv";
import Invoice from "../models/invoice.model.js";

dotenv.config();


const backfill = async () => {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.DB_CONNECTION);
        const invoiceResult = await Invoice.updateMany(
            {},
            { $set: { invoiceStatus: "Paid" } }
        );
        console.log(`Invoices updated: ${invoiceResult.modifiedCount}`);
    } catch (error) {
        console.error("Backfill failed:", error);
        process.exit(1);
    }
};

backfill();
