
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import healthRoutes from "./routes/healthRoutes.js";
import instagramRoutes from "./routes/instagramRoutes.js";
import youtubeRoutes from "./routes/youtubeRoutes.js";
import youtubeUploadRoutes from "./routes/youtubeUploadRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/youtube", youtubeUploadRoutes);


// Home route
app.get("/", (req, res) => {
  res.send("Instagram to YouTube Automation API is running!");
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
