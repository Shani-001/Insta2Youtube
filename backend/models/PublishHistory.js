
import mongoose from "mongoose";

const publishHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    instagramPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstagramPost",
      default: null
    },

    source: {
      type: String,
      enum: ["INSTAGRAM", "MANUAL"],
      default: "MANUAL"
    },

    youtubeVideoId: {
      type: String,
      default: ""
    },

    youtubeVideoUrl: {
      type: String,
      default: ""
    },

    videoTitle: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SUCCESS", "FAILED"],
      default: "PENDING"
    },

    errorMessage: {
      type: String,
      default: ""
    },

    publishedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const PublishHistory = mongoose.model(
  "PublishHistory",
  publishHistorySchema
);

export default PublishHistory;
