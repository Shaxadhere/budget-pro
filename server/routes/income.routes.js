import express from "express";
import {
    createIncome,
    deleteIncome,
    getIncome,
    getIncomes,
    updateIncome
} from "../controllers/income.controller.js";
import { authenticatedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticatedRoute, getIncomes);
router.get("/:id", authenticatedRoute, getIncome);
router.post("/", authenticatedRoute, createIncome);
router.put("/:id", authenticatedRoute, updateIncome);
router.delete("/:id", authenticatedRoute, deleteIncome);

export default router;
