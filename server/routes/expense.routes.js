import express from "express";
import {
    createExpense,
    deleteExpense,
    getExpense,
    getExpenses,
    updateExpense
} from "../controllers/expense.controller.js";
import { authenticatedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticatedRoute, getExpenses);
router.get("/:id", authenticatedRoute, getExpense);
router.post("/", authenticatedRoute, createExpense);
router.put("/:id", authenticatedRoute, updateExpense);
router.delete("/:id", authenticatedRoute, deleteExpense);

export default router;
