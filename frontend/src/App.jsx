
import { useState } from "react";
import axios from "axios";

import Header from "./components/Header";
import InstagramFetch from "./components/InstagramFetch.jsx";
import InstagramPosts from "./components/InstagramPosts.jsx";
import YouTubeConnection from "./components/YouTubeConnection.jsx";
import ManualUpload from "./components/ManualUpload.jsx";
import UploadHistory from "./components/UploadHistory.jsx";

function App() {
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const youtubeConnected = urlParams.get("youtube") === "connected";
  const channelName = urlParams.get("channel");

  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualUploading, setManualUploading] = useState(false);
  const [manualMessage, setManualMessage] = useState("");

  const [uploadHistory, setUploadHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Fetch Instagram posts by username
  const handleFetch = async () => {
    if (!username.trim()) {
      setError("Please enter an Instagram username");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPosts([]);
      setSelectedPosts([]);

      const response = await axios.post(
        "http://localhost:5000/api/instagram/fetch",
        { username },
      );

      setPosts(response.data.posts);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to fetch Instagram posts",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts from connected Instagram account
  const handleFetchOwn = async () => {
    try {
      setLoading(true);
      setError("");
      setPosts([]);
      setSelectedPosts([]);

      const response = await axios.get(
        "http://localhost:5000/api/instagram/my-posts",
      );

      setPosts(response.data.posts);

      if (response.data.posts.length === 0) {
        setError("No Instagram posts found in your account.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to fetch your Instagram posts",
      );
    } finally {
      setLoading(false);
    }
  };

  // Select or deselect an Instagram post
  const togglePost = (postId) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  // Fetch YouTube upload history
  const fetchUploadHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      const response = await axios.get(
        "http://localhost:5000/api/youtube/history",
      );

      setUploadHistory(response.data.history);
    } catch (error) {
      setHistoryError(
        error.response?.data?.message || "Unable to fetch upload history",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // Publish selected Instagram videos to YouTube
  const handlePublish = async () => {
    if (!youtubeConnected) {
      setPublishMessage("Please connect your YouTube account first.");
      return;
    }

    const selected = posts.filter(
      (post) =>
        selectedPosts.includes(post.instagramPostId) &&
        post.mediaType === "VIDEO",
    );

    if (selected.length === 0) {
      setPublishMessage("Please select at least one video post.");
      return;
    }

    const availableVideos = selected.filter((post) => post.mediaUrl);
    const unavailableCount = selected.length - availableVideos.length;

    if (availableVideos.length === 0) {
      setPublishMessage(
        `${unavailableCount} selected video(s) have no downloadable video URL from Instagram.`,
      );
      return;
    }

    let successCount = 0;
    let failedCount = 0;

    try {
      setPublishing(true);
      setPublishMessage(
        `Starting upload of ${availableVideos.length} video(s)...`,
      );

      for (let i = 0; i < availableVideos.length; i++) {
        const post = availableVideos[i];

        setPublishMessage(
          `Uploading video ${i + 1} of ${availableVideos.length}...`,
        );

        try {
          const response = await axios.post(
            "http://localhost:5000/api/youtube/upload-instagram",
            {
              videoUrl: post.mediaUrl,
              title: post.caption
                ? post.caption.slice(0, 100)
                : `Instagram video by ${post.username}`,
              description: post.caption || "",
              instagramPostId: post.instagramPostId,
            },
          );

          if (response.data.success) {
            successCount++;
          } else {
            failedCount++;
          }
        } catch (uploadError) {
          console.error(
            "Failed Instagram post:",
            post.instagramPostId,
            uploadError.response?.data || uploadError.message,
          );

          failedCount++;
        }

        setPublishMessage(
          `Processed ${i + 1}/${availableVideos.length} videos. Successful: ${successCount}, Failed: ${failedCount}, Unavailable: ${unavailableCount}`,
        );
      }

      setPublishMessage(
        `${successCount} uploaded successfully, ${failedCount} failed, ${unavailableCount} unavailable.`,
      );

      await fetchUploadHistory();
    } finally {
      setPublishing(false);
    }
  };

  // Upload a video manually from computer
  const handleManualUpload = async () => {
    if (!videoFile) {
      setManualMessage("Please select a video file.");
      return;
    }

    if (!youtubeConnected) {
      setManualMessage("Please connect your YouTube account first.");
      return;
    }

    try {
      setManualUploading(true);
      setManualMessage("");

      const formData = new FormData();

      formData.append("video", videoFile);
      formData.append("title", manualTitle || videoFile.name);
      formData.append("description", manualDescription);

      const response = await axios.post(
        "http://localhost:5000/api/youtube/upload",
        formData,
      );

      setManualMessage(
        `Video uploaded successfully! ${response.data.videoUrl}`,
      );

      setVideoFile(null);
      setManualTitle("");
      setManualDescription("");

      await fetchUploadHistory();
    } catch (error) {
      setManualMessage(
        error.response?.data?.message || "Video upload failed.",
      );
    } finally {
      setManualUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">
            Turn Instagram Posts into YouTube Videos
          </h2>

          <p className="text-slate-500 mt-3">
            Fetch Instagram posts and publish selected content to YouTube.
          </p>
        </div>

        <InstagramFetch
          username={username}
          setUsername={setUsername}
          handleFetch={handleFetch}
          handleFetchOwn={handleFetchOwn}
          loading={loading}
          error={error}
        />

        <InstagramPosts
          posts={posts}
          selectedPosts={selectedPosts}
          togglePost={togglePost}
          handlePublish={handlePublish}
          publishing={publishing}
          publishMessage={publishMessage}
        />

        <YouTubeConnection
          youtubeConnected={youtubeConnected}
          channelName={channelName}
        />

        <ManualUpload
          videoFile={videoFile}
          setVideoFile={setVideoFile}
          manualTitle={manualTitle}
          setManualTitle={setManualTitle}
          manualDescription={manualDescription}
          setManualDescription={setManualDescription}
          handleManualUpload={handleManualUpload}
          manualUploading={manualUploading}
          manualMessage={manualMessage}
          youtubeConnected={youtubeConnected}
        />

        <UploadHistory
          uploadHistory={uploadHistory}
          fetchUploadHistory={fetchUploadHistory}
          historyLoading={historyLoading}
          historyError={historyError}
        />
      </main>
    </div>
  );
}

export default App;
