import express from "express";
import {
    createBankInfo,
    deleteBankInfo,
    getBankInfo,
    getBankInfos,
    updateBankInfo
} from "../controllers/bankInfo.controller.js";
import { authenticatedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticatedRoute, getBankInfos);
router.get("/:id", authenticatedRoute, getBankInfo);
router.post("/", authenticatedRoute, createBankInfo);
router.put("/:id", authenticatedRoute, updateBankInfo);
router.delete("/:id", authenticatedRoute, deleteBankInfo);

export default router;
