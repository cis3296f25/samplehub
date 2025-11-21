import express from "express";
import { uploadSound } from "../controllers/userController.js";
import { upload } from "../middleware/upload.js";
import { requireFirebaseAuth } from "../middleware/requireFirebaseAuth.js";
import { ensureUser } from "../middleware/ensureUser.js";

const router = express.Router();

router.post(
  "/upload",
  requireFirebaseAuth,
  ensureUser,
  upload.single("file"),
  uploadSound,
);

export default router;
