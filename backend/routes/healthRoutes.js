
import express from "express";

const router = express.Router();

// Health check API
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is working properly"
  });
});

export default router;
