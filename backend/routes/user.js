import express from "express";
import {
  uploadSound,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from "../controllers/userController.js";
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

router.get("/favorites", requireFirebaseAuth, ensureUser, getFavorites);
router.post("/favorites", requireFirebaseAuth, ensureUser, addToFavorites);
router.delete("/favorites", requireFirebaseAuth, ensureUser, removeFromFavorites);

export default router;
