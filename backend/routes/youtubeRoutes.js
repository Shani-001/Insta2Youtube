
import express from "express";

import {
  connectYouTube,
  youtubeCallback,
  uploadVideo,
  uploadInstagramVideo,
  getUploadHistory
} from "../controllers/youtubeController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

// Google OAuth
router.get("/connect", connectYouTube);
router.get("/callback", youtubeCallback);

// Manual video upload
router.post("/upload", upload.single("video"), uploadVideo);

// Instagram video upload
router.post("/upload-instagram", uploadInstagramVideo);

// Upload history
router.get("/history", getUploadHistory);

export default router;
