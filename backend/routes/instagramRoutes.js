
import express from "express";

import {
  getInstagramPosts,
  getOwnInstagramPosts
} from "../controllers/instagramController.js";

const router = express.Router();

// Fetch posts from another public Instagram account
router.post("/fetch", getInstagramPosts);

// Fetch posts from your own connected Instagram account
router.get("/my-posts", getOwnInstagramPosts);

export default router;
