import express from "express";
import {
    createLoan,
    deleteLoan,
    getLoan,
    getLoans,
    updateLoan
} from "../controllers/loan.controller.js";
import { authenticatedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticatedRoute, getLoans);
router.get("/:id", authenticatedRoute, getLoan);
router.post("/", authenticatedRoute, createLoan);
router.put("/:id", authenticatedRoute, updateLoan);
router.delete("/:id", authenticatedRoute, deleteLoan);

export default router;
