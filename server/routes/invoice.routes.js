import express from "express";
import {
    createInvoice,
    deleteInvoice,
    getInvoice,
    getInvoices,
    updateInvoice,
    getInvoiceFacet,
    updateInvoiceStatus,
    markAllInvoicesPaid
} from "../controllers/invoice.controller.js";
import { authenticatedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticatedRoute, getInvoices);
router.get("/facet", authenticatedRoute, getInvoiceFacet);
router.patch("/mark-all-paid", authenticatedRoute, markAllInvoicesPaid);
router.get("/:id", authenticatedRoute, getInvoice);
router.post("/", authenticatedRoute, createInvoice);
router.put("/:id", authenticatedRoute, updateInvoice);
router.patch("/:id", authenticatedRoute, updateInvoiceStatus);
router.delete("/:id", authenticatedRoute, deleteInvoice);

export default router;