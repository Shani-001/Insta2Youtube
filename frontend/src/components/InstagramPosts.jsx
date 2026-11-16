
import { LoaderCircle } from "lucide-react";

function InstagramPosts({
  posts,
  selectedPosts,
  togglePost,
  handlePublish,
  publishing,
  publishMessage,
}) {
  if (posts.length === 0) return null;

  return (
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
                src={post.mediaUrl || undefined}
                poster={post.thumbnailUrl || undefined}
                controls
                className="w-full h-56 object-cover"
              />
            ) : (
              <img
                src={post.mediaUrl || post.thumbnailUrl || ""}
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

              {post.permalink && (
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-600 text-sm mt-3 inline-block"
                >
                  View on Instagram
                </a>
              )}
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
        className="mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2"
      >
        {publishing && (
          <LoaderCircle className="animate-spin" size={20} />
        )}

        {publishing
          ? "Uploading to YouTube..."
          : "Publish Selected Videos"}
      </button>

      {publishing && (
        <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <LoaderCircle
              className="animate-spin text-red-600"
              size={28}
            />

            <div>
              <p className="font-semibold text-red-700">
                Uploading videos to YouTube...
              </p>

              <p className="text-sm text-red-600">
                {publishMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {!publishing && publishMessage && (
        <p className="mt-4 text-sm font-medium text-slate-700">
          {publishMessage}
        </p>
      )}
    </div>
  );
}

export default InstagramPosts;
