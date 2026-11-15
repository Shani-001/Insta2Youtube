import { useState } from "react";
import axios from "axios";
import { Camera, Video, Search } from "lucide-react";

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

  const handleFetch = async () => {
    if (!username.trim()) {
      setError("Please enter an Instagram username");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPosts([]);

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

  const togglePost = (postId) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  // const handlePublish = async () => {
  //   const selected = posts.filter(
  //     (post) =>
  //       selectedPosts.includes(post.instagramPostId) &&
  //       post.mediaType === "VIDEO" &&
  //       post.mediaUrl,
  //   );

  //   if (selected.length === 0) {
  //     setPublishMessage(
  //       "Selected videos cannot be uploaded because Instagram has not provided their video URLs. Try a video with downloads enabled and without restricted copyrighted content.",
  //     );
  //     return;
  //   }

  //   if (selected.length === 0) {
  //     setPublishMessage("Please select at least one video post.");
  //     return;
  //   }

  //   try {
  //     setPublishing(true);
  //     setPublishMessage("");

  //     let successCount = 0;

  //     for (const post of selected) {
  //       console.log("Selected video post:", post);

  //       console.log("Upload data:", {
  //         videoUrl: post.mediaUrl,
  //         title: post.caption || `Instagram video by ${post.username}`,
  //         description: post.caption || "",
  //       });

  //       await axios.post("http://localhost:5000/api/youtube/upload", {
  //         videoUrl: post.mediaUrl,
  //         title: post.caption || `Instagram video by ${post.username}`,
  //         description: post.caption || "",
  //       });
  //     }

  //     setPublishMessage(
  //       `${successCount} video(s) uploaded successfully to YouTube!`,
  //     );
  //   } catch (error) {
  //     setPublishMessage(
  //       error.response?.data?.message || "Video upload failed.",
  //     );
  //   } finally {
  //     setPublishing(false);
  //   }
  // };

  const handlePublish = async () => {
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

    try {
      setPublishing(true);
      setPublishMessage("");

      let successCount = 0;
      let failedCount = 0;

      for (const post of availableVideos) {
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
        } catch (error) {
          console.error(
            "Failed Instagram post:",
            post.instagramPostId,
            error.response?.data || error.message,
          );

          failedCount++;
        }
      }

      setPublishMessage(
        `${successCount} uploaded successfully, ${failedCount} failed, ${unavailableCount} unavailable.`,
      );

      await fetchUploadHistory();
    } finally {
      setPublishing(false);
    }
  };

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
    } catch (error) {
      setManualMessage(error.response?.data?.message || "Video upload failed.");
    } finally {
      setManualUploading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-800">Insta2YouTube</h1>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">
            Turn Instagram Posts into YouTube Videos
          </h2>
          <p className="text-slate-500 mt-3">
            Fetch Instagram posts and publish selected content to YouTube.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Camera className="text-pink-600" size={28} />
            <h3 className="text-xl font-semibold">Fetch Instagram Posts</h3>
          </div>

          <label className="block text-sm font-medium mb-2">
            Instagram Username or Profile URL
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or profile URL"
              className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
            />

            <button
              onClick={handleFetch}
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Search size={18} />
              {loading ? "Fetching..." : "Fetch Posts"}
            </button>

            <button
              onClick={handleFetchOwn}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg"
            >
              Fetch My Posts
            </button>
          </div>

          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>

        {posts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-5">
              Instagram Posts ({posts.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {posts.map((post) => (
                <div
                  key={post.instagramPostId}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {post.mediaType === "VIDEO" ? (
                    <video
                      src={post.mediaUrl}
                      poster={post.thumbnailUrl}
                      controls
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt={post.caption || "Instagram post"}
                      className="w-full h-56 object-cover"
                    />
                  )}

                  <div className="p-4">
                    <div className="mb-3">
                      {post.mediaType === "VIDEO" && post.mediaUrl ? (
                        <span className="text-green-600 font-semibold text-sm">
                          ✓ Video URL Available
                        </span>
                      ) : post.mediaType === "VIDEO" ? (
                        <span className="text-red-600 font-semibold text-sm">
                          ✕ Video URL Unavailable
                        </span>
                      ) : (
                        <span className="text-slate-500 text-sm">
                          Image Post
                        </span>
                      )}
                    </div>
                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.instagramPostId)}
                        onChange={() => togglePost(post.instagramPostId)}
                        className="w-4 h-4 accent-pink-600"
                      />
                      <span className="text-sm font-medium">
                        Select this post
                      </span>
                    </label>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {post.caption || "No caption available"}
                    </p>

                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-pink-600 text-sm mt-3 inline-block"
                    >
                      View on Instagram
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 font-semibold text-slate-700">
              Selected Posts: {selectedPosts.length}
            </p>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg"
            >
              {publishing ? "Publishing..." : "Publish Selected Videos"}
            </button>

            {publishMessage && (
              <p className="mt-4 text-sm text-slate-700">{publishMessage}</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8 mt-8">
          <div className="flex items-center gap-3">
            <Video className="text-red-600" size={28} />
            <h3 className="text-xl font-semibold">YouTube Channel</h3>
          </div>

          <p className="text-slate-500 mt-3">
            Connect your YouTube account to publish selected Instagram posts.
          </p>

          {youtubeConnected ? (
            <div className="mt-5">
              <p className="text-green-600 font-semibold">
                ✓ YouTube Connected Successfully
              </p>

              <p className="text-slate-600 mt-2">
                Channel: {channelName || "Connected Channel"}
              </p>
            </div>
          ) : (
            <button
              onClick={() => {
                window.location.href =
                  "http://localhost:5000/api/youtube/connect";
              }}
              className="mt-5 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
            >
              Connect YouTube
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 mt-8">
          <h3 className="text-xl font-semibold mb-5">
            Upload Video from Computer
          </h3>

          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0] || null)}
            className="w-full border border-slate-300 rounded-lg p-3 mb-4"
          />

          <input
            type="text"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            placeholder="Enter YouTube video title"
            className="w-full border border-slate-300 rounded-lg p-3 mb-4"
          />

          <textarea
            value={manualDescription}
            onChange={(e) => setManualDescription(e.target.value)}
            placeholder="Enter video description"
            className="w-full border border-slate-300 rounded-lg p-3 mb-4"
            rows="4"
          />

          <button
            onClick={handleManualUpload}
            disabled={manualUploading || !videoFile || !youtubeConnected}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg"
          >
            {manualUploading ? "Uploading..." : "Upload to YouTube"}
          </button>

          {manualMessage && (
            <p className="mt-4 text-sm text-slate-700 break-all">
              {manualMessage}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5">
            <h3 className="text-xl font-semibold">YouTube Upload History</h3>

            <button
              onClick={fetchUploadHistory}
              disabled={historyLoading}
              className="bg-slate-800 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {historyLoading ? "Loading..." : "Refresh History"}
            </button>
          </div>

          {historyError && <p className="text-red-600">{historyError}</p>}

          {uploadHistory.length === 0 && !historyLoading && !historyError && (
            <p className="text-slate-500">
              Click Refresh History to view your uploads.
            </p>
          )}

          <div className="space-y-4">
            {uploadHistory.map((item) => (
              <div
                key={item._id}
                className="border border-slate-200 rounded-lg p-4"
              >
                <h4 className="font-semibold text-slate-800">
                  {item.videoTitle}
                </h4>

                <p className="text-sm text-slate-500 mt-2">
                  Source: {item.source}
                </p>

                <p className="text-sm text-slate-500">Status: {item.status}</p>

                <p className="text-sm text-slate-500">
                  Uploaded:{" "}
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleString()
                    : "Not available"}
                </p>

                {item.youtubeVideoUrl && (
                  <a
                    href={item.youtubeVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-600 text-sm inline-block mt-2"
                  >
                    Watch on YouTube
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
