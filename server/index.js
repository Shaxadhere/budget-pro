//importing modules
import express, { json } from "express";
import { connect } from "mongoose";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

//importing models
import User from "./models/user.model.js";

//importing routes
import authRoutes from "./routes/auth.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js"
import userRoutes from "./routes/user.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import bankInfoRoutes from "./routes/bankInfo.routes.js";
import companyRoutes from "./routes/company.routes.js";
import loanRoutes from "./routes/loan.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import incomeRoutes from "./routes/income.routes.js";
import creditCardRoutes from "./routes/creditCard.routes.js";

//initialising app
const app = express();

//initialising database connection
if (!process.env.DB_CONNECTION || process.env.DB_CONNECTION === "MONGO_DB_CONNECTION_URI") {
    console.error("Error: MongoDB connection URI is missing.");
    console.error("Please add the MongoDB URI in the server/.env file.");
    console.error("Look at the .env.example file, create a new .env file with its contents, and fill out the values with your real values.");
    process.exit(1);
}

connect(process.env.DB_CONNECTION)
    .then(async () => {
        console.log("Database connected");
        try {
            const usersCount = await User.countDocuments();
            if (usersCount === 0) {
                const adminUser = new User({
                    name: "Admin User",
                    email: "anyone@example.com",
                    password: "password123"
                });
                await adminUser.save();
                console.log("Admin user seeded successfully.");
            }
        } catch (error) {
            console.error("Error seeding user:", error);
        }
    })
    .catch((error) => console.log(error));

//middlewares
const coreOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: "Content-Type, Authorization, X-Requested-With, Accept, VERSION",
    exposedHeaders: "Content-Type, Authorization, X-Requested-With, Accept, VERSION",
}
app.use(cors());
app.use(morgan("dev"));
app.use(json())

//registering routes
app.get("/", (req, res) => res.json({ message: "Server is up and running" }))
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/user", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bank-info", bankInfoRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/credit-cards", creditCardRoutes);


// app.use("/uploads", expressStatic("uploads"));

//listen to server
const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

