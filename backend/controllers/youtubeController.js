
import { google } from "googleapis";
import oauth2Client from "../config/googleOAuth.js";
import User from "../models/User.js";
import fs from "fs";
import PublishHistory from "../models/PublishHistory.js";
import axios from "axios";

export const connectYouTube = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  });

  res.redirect(authUrl);
};

export const youtubeCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Google authorization code is missing");
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2"
    });

    const profileResponse = await oauth2.userinfo.get();
    const profile = profileResponse.data;

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client
    });

    const channelResponse = await youtube.channels.list({
      part: ["snippet"],
      mine: true
    });

    const channel = channelResponse.data.items?.[0];

    if (!channel) {
      return res.status(400).send("No YouTube channel found for this Google account");
    }

    const user = await User.findOneAndUpdate(
      { googleId: profile.id },
      {
        googleId: profile.id,
        name: profile.name || "YouTube User",
        email: profile.email,
        profilePicture: profile.picture || "",
        youtubeChannelId: channel.id,
        youtubeChannelName: channel.snippet.title,
        accessToken: tokens.access_token,
        ...(tokens.refresh_token && {
          refreshToken: tokens.refresh_token
        }),
        tokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.redirect(
      `http://localhost:5173/?youtube=connected&channel=${encodeURIComponent(user.youtubeChannelName)}`
    );

  } catch (error) {
    console.error("YouTube OAuth Error:", error.message);

    res.status(500).send("Unable to connect YouTube account");
  }
};


export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a video file"
      });
    }

    // For this single-user local project, get the latest connected account
    const user = await User.findOne().sort({ updatedAt: -1 });

    if (!user || !user.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Please connect your YouTube account first"
      });
    }

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
      expiry_date: user.tokenExpiry
        ? new Date(user.tokenExpiry).getTime()
        : undefined
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client
    });

    const title = req.body.title || req.file.originalname;
    const description = req.body.description || "";

    const response = await youtube.videos.insert({
      part: ["snippet", "status"],

      requestBody: {
        snippet: {
          title,
          description
        },
        status: {
          privacyStatus: "private"
        }
      },

      media: {
        body: fs.createReadStream(req.file.path)
      }
    });

    const videoId = response.data.id;

const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

await PublishHistory.create({
  userId: user._id,
  source: "MANUAL",
  youtubeVideoId: videoId,
  youtubeVideoUrl: videoUrl,
  videoTitle: title,
  status: "SUCCESS",
  publishedAt: new Date()
});

    // Save refreshed credentials if Google refreshed the token
    const credentials = oauth2Client.credentials;

    if (credentials.access_token) {
      user.accessToken = credentials.access_token;
    }

    if (credentials.expiry_date) {
      user.tokenExpiry = new Date(credentials.expiry_date);
    }

    await user.save();

    return res.status(200).json({
  success: true,
  message: "Video uploaded successfully",
  videoId,
  videoUrl
});

  } catch (error) {
    console.error("YouTube Upload Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Video upload failed"
    });

  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};


export const getUploadHistory = async (req, res) => {
  try {
    const user = await User.findOne().sort({ updatedAt: -1 });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const history = await PublishHistory.find({
      userId: user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: history.length,
      history
    });

  } catch (error) {
    console.error("Upload History Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch upload history"
    });
  }
};



export const uploadInstagramVideo = async (req, res) => {
  try {
    const { videoUrl, title, description, instagramPostId } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Instagram video URL is missing"
      });
    }

    // Allow only Instagram CDN URLs
    
const parsedUrl = new URL(videoUrl);

const hostname = parsedUrl.hostname.toLowerCase();

const isInstagramCDN =
  hostname.endsWith(".cdninstagram.com") ||
  hostname === "cdninstagram.com" ||
  hostname.endsWith(".fbcdn.net") ||
  hostname === "fbcdn.net";

if (parsedUrl.protocol !== "https:" || !isInstagramCDN) {
  return res.status(400).json({
    success: false,
    message: "Invalid Instagram video URL"
  });
}


    const user = await User.findOne().sort({ updatedAt: -1 });

    if (!user || !user.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Please connect YouTube first"
      });
    }

    // Download video as a stream
    const videoResponse = await axios.get(videoUrl, {
      responseType: "stream",
      timeout: 120000,
      maxContentLength: Infinity
    });

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
      expiry_date: user.tokenExpiry
        ? new Date(user.tokenExpiry).getTime()
        : undefined
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client
    });

    const videoTitle = (title || "Instagram Video").slice(0, 100);

    // Upload video to YouTube
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],

      requestBody: {
        snippet: {
          title: videoTitle,
          description: description || ""
        },
        status: {
          privacyStatus: "private"
        }
      },

      media: {
        body: videoResponse.data
      }
    });

    const videoId = response.data.id;
    const youtubeVideoUrl =
      `https://www.youtube.com/watch?v=${videoId}`;

    // Save upload history
    await PublishHistory.create({
      userId: user._id,
      instagramPostId: null,
      source: "INSTAGRAM",
      youtubeVideoId: videoId,
      youtubeVideoUrl,
      videoTitle,
      status: "SUCCESS",
      publishedAt: new Date()
    });

    // Save refreshed credentials
    const credentials = oauth2Client.credentials;

    if (credentials.access_token) {
      user.accessToken = credentials.access_token;
    }

    if (credentials.expiry_date) {
      user.tokenExpiry = new Date(credentials.expiry_date);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Instagram video uploaded successfully",
      videoId,
      videoUrl: youtubeVideoUrl
    });

  } catch (error) {
    console.error(
      "Instagram YouTube Upload Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Instagram video upload failed"
    });
  }
};
