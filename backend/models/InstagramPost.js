
import mongoose from "mongoose";

const instagramPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    instagramPostId: {
      type: String,
      required: true
    },

    username: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ""
    },

    mediaUrl: {
      type: String,
      required: true
    },

    thumbnailUrl: {
      type: String,
      default: ""
    },

    mediaType: {
      type: String,
      enum: ["IMAGE", "VIDEO", "CAROUSEL"],
      required: true
    },

    permalink: {
      type: String,
      default: ""
    },

    published: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["FETCHED", "SELECTED", "PUBLISHED", "FAILED"],
      default: "FETCHED"
    }
  },
  { timestamps: true }
);

const InstagramPost = mongoose.model(
  "InstagramPost",
  instagramPostSchema
);

export default InstagramPost;
