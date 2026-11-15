
import fetchInstagramPosts from "../services/instagramService.js";
import { fetchOwnInstagramPosts } from "../services/instagramService.js";

const getUsername = (input) => {
  let username = input.trim();

  if (username.includes("instagram.com")) {
    const url = new URL(
      username.startsWith("http") ? username : `https://${username}`
    );

    if (
      !["instagram.com", "www.instagram.com"].includes(url.hostname)
    ) {
      throw new Error("Invalid Instagram profile URL");
    }

    username = url.pathname.split("/").filter(Boolean)[0] || "";
  }

  username = username.replace(/^@/, "");

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    throw new Error("Please enter a valid Instagram username");
  }

  return username;
};

export const getInstagramPosts = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Instagram username is required"
      });
    }

    const cleanUsername = getUsername(username);

    const posts = await fetchInstagramPosts(cleanUsername);
    const videoPost = posts.find(
  (post) => post.media_type === "VIDEO"
);

console.log(
  "Available Instagram videos:",
  posts
    .filter((post) => post.media_type === "VIDEO")
    .map((post) => ({
      id: post.id,
      caption: post.caption?.substring(0, 50),
      hasVideoUrl: Boolean(post.media_url),
      hasThumbnail: Boolean(post.thumbnail_url)
    }))
);

    const formattedPosts = posts.map((post) => ({
      instagramPostId: post.id,
      username: cleanUsername,
      caption: post.caption || "",
      mediaUrl: post.media_url,
      thumbnailUrl: post.thumbnail_url || "",
      mediaType: post.media_type,
      permalink: post.permalink || "",
      timestamp: post.timestamp
    }));

    return res.status(200).json({
      success: true,
      username: cleanUsername,
      totalPosts: formattedPosts.length,
      posts: formattedPosts
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


export const getOwnInstagramPosts = async (req, res) => {
  try {
    const posts = await fetchOwnInstagramPosts();

    const formattedPosts = posts.map((post) => ({
      instagramPostId: post.id,
      username: "your Instagram account",
      caption: post.caption || "",
      mediaUrl: post.media_url || "",
      thumbnailUrl: post.thumbnail_url || "",
      mediaType:
        post.media_type === "CAROUSEL_ALBUM"
          ? "CAROUSEL"
          : post.media_type,
      permalink: post.permalink || "",
      timestamp: post.timestamp || ""
    }));

    return res.status(200).json({
      success: true,
      totalPosts: formattedPosts.length,
      posts: formattedPosts
    });

  } catch (error) {
    console.error("Own Instagram Posts Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch your Instagram posts"
    });
  }
};
