import express from "express";
import { searchSamples } from "../controllers/searchController.js";

const router = express.Router();

router.get("/search", searchSamples);

export default router;
