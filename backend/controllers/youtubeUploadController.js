
import oauth2Client from "../config/googleOAuth.js";
import User from "../models/User.js";
import uploadVideoToYouTube from "../services/youtubeService.js";

export const uploadToYouTube = async (req, res) => {
  try {
    const { videoUrl, title, description } = req.body;

    if (!videoUrl || !title) {
      return res.status(400).json({
        success: false,
        message: "Video URL and title are required"
      });
    }

    const user = await User.findOne({
      youtubeChannelId: { $ne: "" }
    }).sort({ updatedAt: -1 });

    if (!user || !user.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Please connect your YouTube account first"
      });
    }

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
      expiry_date: user.tokenExpiry?.getTime()
    });

    const result = await uploadVideoToYouTube(
      oauth2Client,
      videoUrl,
      title,
      description
    );

    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      videoId: result.videoId,
      videoUrl: result.videoUrl
    });

  } catch (error) {
    console.error("Upload Controller Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
