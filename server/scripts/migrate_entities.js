import mongoose from "mongoose";
import dotenv from "dotenv";
import Invoice from "../models/invoice.model.js";
import Customer from "../models/customer.model.js";
import Company from "../models/company.model.js";
import BankInfo from "../models/bankInfo.model.js";

dotenv.config();

const migrate = async () => {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.DB_CONNECTION);
        console.log("Connected.");

        const invoices = await Invoice.find({});
        console.log(`Found ${invoices.length} invoices to process.`);

        let customersAdded = 0;
        let companiesAdded = 0;
        let bankInfosAdded = 0;

        for (const inv of invoices) {
            if (!inv.userId) {
                console.warn(`Skipping invoice ${inv.invoiceNumber} due to missing userId`);
                continue;
            }

            // 1. Upsert Customer
            // Match by email AND userId to allow same email for different users (multi-tenancy)
            const customerData = {
                userId: inv.userId,
                name: inv.clientName,
                email: inv.clientEmail,
                phone: inv.clientPhone,
                address: inv.clientAddress,
            };

            const custRes = await Customer.updateOne(
                { email: inv.clientEmail, userId: inv.userId },
                { $setOnInsert: customerData },
                { upsert: true }
            );
            if (custRes.upsertedCount > 0) customersAdded++;

            // 2. Upsert Company
            const companyData = {
                userId: inv.userId,
                companyName: inv.companyName,
                companyTagline: inv.companyTagline,
                contactEmail: inv.contactEmail,
                contactPhone: inv.contactPhone,
                contactWebsite: inv.contactWebsite,
            };

            const compRes = await Company.updateOne(
                { companyName: inv.companyName, userId: inv.userId },
                { $setOnInsert: companyData },
                { upsert: true }
            );
            if (compRes.upsertedCount > 0) companiesAdded++;

            // 3. Upsert Bank Info
            // inv.bankDetails is an object
            if (inv.bankDetails && inv.bankDetails.accountNumber) {
                const bankData = {
                    userId: inv.userId,
                    bankName: inv.bankDetails.bankName,
                    accountNumber: inv.bankDetails.accountNumber,
                    accountTitle: inv.bankDetails.accountTitle,
                    currency: inv.currency, // Assuming account currency matches invoice currency
                };

                const bankRes = await BankInfo.updateOne(
                    { accountNumber: inv.bankDetails.accountNumber, userId: inv.userId },
                    { $setOnInsert: bankData },
                    { upsert: true }
                );
                if (bankRes.upsertedCount > 0) bankInfosAdded++;
            }
        }

        console.log("Migration Complete.");
        console.log(`Customers Added: ${customersAdded}`);
        console.log(`Companies Added: ${companiesAdded}`);
        console.log(`Bank Accounts Added: ${bankInfosAdded}`);

        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
