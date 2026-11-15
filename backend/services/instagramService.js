
import axios from "axios";

const BASE_URL = "https://graph.facebook.com";

// Fetch posts from another public professional account
const fetchInstagramPosts = async (username) => {
  try {
    const instagramUserId = process.env.INSTAGRAM_USER_ID;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const apiVersion = process.env.INSTAGRAM_API_VERSION;

    if (!instagramUserId || !accessToken || !apiVersion) {
      throw new Error("Instagram API credentials are missing");
    }

    const fields = `business_discovery.username(${username}){username,media.limit(25){id,caption,media_type,media_url,thumbnail_url,permalink,timestamp}}`;

    let url = `${BASE_URL}/${apiVersion}/${instagramUserId}`;

    let params = {
      fields,
      access_token: accessToken
    };

    const posts = [];
    let pageCount = 0;

    while (url && pageCount < 3) {
      const response = await axios.get(url, { params });

      const media = response.data.business_discovery?.media;

      if (!media) {
        throw new Error("No Instagram media data received");
      }

      posts.push(...(media.data || []));

      url = media.paging?.next || null;
      params = {};
      pageCount++;
    }

    return posts;
  } catch (error) {
    const apiError = error.response?.data?.error;

    throw new Error(
      apiError?.message || error.message ||
      "Unable to fetch Instagram posts"
    );
  }
};

// Fetch posts from your own connected Instagram account
export const fetchOwnInstagramPosts = async () => {
  try {
    const instagramUserId = process.env.INSTAGRAM_USER_ID;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const apiVersion = process.env.INSTAGRAM_API_VERSION;

    if (!instagramUserId || !accessToken || !apiVersion) {
      throw new Error("Instagram API credentials are missing");
    }

    let url = `${BASE_URL}/${apiVersion}/${instagramUserId}/media`;

    let params = {
      fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
      limit: 25,
      access_token: accessToken
    };

    const posts = [];
    let pageCount = 0;

    while (url && pageCount < 3) {
      const response = await axios.get(url, { params });

      posts.push(...(response.data.data || []));

      url = response.data.paging?.next || null;
      params = {};
      pageCount++;
    }

    return posts;
  } catch (error) {
    const apiError = error.response?.data?.error;

    console.error(
      "Own Instagram API Error:",
      apiError?.message || error.message
    );

    throw new Error(
      apiError?.message || error.message ||
      "Unable to fetch your Instagram posts"
    );
  }
};

export default fetchInstagramPosts;
