import express from "express";
import {
    createCustomer,
    deleteCustomer,
    getCustomer,
    getCustomers,
    updateCustomer
} from "../controllers/customer.controller.js";
import { authenticatedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticatedRoute, getCustomers);
router.get("/:id", authenticatedRoute, getCustomer);
router.post("/", authenticatedRoute, createCustomer);
router.put("/:id", authenticatedRoute, updateCustomer);
router.delete("/:id", authenticatedRoute, deleteCustomer);

export default router;
