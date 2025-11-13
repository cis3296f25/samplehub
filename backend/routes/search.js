import express from "express";
import { getNewestFirst } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", getNewestFirst);

export default router;
