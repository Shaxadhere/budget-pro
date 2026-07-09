import express from "express";
import {
    createCompany,
    deleteCompany,
    getCompanies,
    getCompany,
    updateCompany
} from "../controllers/company.controller.js";
import { authenticatedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticatedRoute, getCompanies);
router.get("/:id", authenticatedRoute, getCompany);
router.post("/", authenticatedRoute, createCompany);
router.put("/:id", authenticatedRoute, updateCompany);
router.delete("/:id", authenticatedRoute, deleteCompany);

export default router;
