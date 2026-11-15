
import axios from "axios";
import { google } from "googleapis";

const uploadVideoToYouTube = async (
  oauth2Client,
  videoUrl,
  title,
  description
) => {
  try {
    const videoResponse = await axios.get(videoUrl, {
      responseType: "stream"
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client
    });

    const response = await youtube.videos.insert({
      part: ["snippet", "status"],

      requestBody: {
        snippet: {
          title: title.substring(0, 100),
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

    return {
      videoId: response.data.id,
      videoUrl: `https://www.youtube.com/watch?v=${response.data.id}`
    };

  } catch (error) {
    console.error("YouTube Upload Error:", error.message);
    throw new Error(
      error.response?.data?.error?.message ||
      error.message ||
      "Video upload failed"
    );
  }
};

export default uploadVideoToYouTube;
