import express from "express";
import {
  uploadSound,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  addPack,
  addSampleToPack,
  removePack,
  removeSampleFromPack,
  getPacks,
  getPackSamples,
  createPackAndAddSample,
  getFavoritesWithDetails,
} from "../controllers/userController.js";
import { downloadFile } from "../controllers/downloadController.js";
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
router.get(
  "/favorites/details",
  requireFirebaseAuth,
  ensureUser,
  getFavoritesWithDetails,
);
router.post("/favorites", requireFirebaseAuth, ensureUser, addToFavorites);
router.delete(
  "/favorites",
  requireFirebaseAuth,
  ensureUser,
  removeFromFavorites,
);

router.get("/packs", requireFirebaseAuth, ensureUser, getPacks);
router.post("/packs", requireFirebaseAuth, ensureUser, addPack);
router.post(
  "/packs/create-and-add",
  requireFirebaseAuth,
  ensureUser,
  createPackAndAddSample,
);

router.delete(
  "/packs/:packId/samples/:sampleId",
  requireFirebaseAuth,
  ensureUser,
  removeSampleFromPack,
);
router.delete("/packs/:packId", requireFirebaseAuth, ensureUser, removePack);

router.get(
  "/packs/:packId/samples",
  requireFirebaseAuth,
  ensureUser,
  getPackSamples,
);
router.post(
  "/packs/:packId/samples",
  requireFirebaseAuth,
  ensureUser,
  addSampleToPack,
);

router.get(
  "/download/:sampleId",
  requireFirebaseAuth,
  ensureUser,
  downloadFile,
);

export default router;
