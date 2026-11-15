
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    profilePicture: {
      type: String,
      default: ""
    },

    youtubeChannelId: {
      type: String,
      default: ""
    },

    youtubeChannelName: {
      type: String,
      default: ""
    },

    accessToken: {
      type: String,
      default: ""
    },

    refreshToken: {
      type: String,
      default: ""
    },

    tokenExpiry: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
