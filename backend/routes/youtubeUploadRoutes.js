
import express from "express";
import { uploadToYouTube } from "../controllers/youtubeUploadController.js";

const router = express.Router();

// Upload video to YouTube
router.post("/upload", uploadToYouTube);

export default router;
