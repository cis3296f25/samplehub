import express from "express";
import {
  loginUser,
  signupUser,
  uploadSound,
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 5 requets per window
  message: { error: "Too many attempts, please try again later" },
});

router.post("/auth/login", authLimiter, loginUser);

router.post("/auth/signup", authLimiter, signupUser);

router.post("/upload", requireAuth, uploadSound);

export default router;
