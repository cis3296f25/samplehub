import express from "express";
import { getRandomVideo } from "../controllers/randomController.js";

const router = express.Router();

router.get("/random", getRandomVideo);

export default router;
