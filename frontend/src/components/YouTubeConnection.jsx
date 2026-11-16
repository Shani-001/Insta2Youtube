
import { Video } from "lucide-react";

function YouTubeConnection({ youtubeConnected, channelName }) {
  const connectYouTube = () => {
    window.location.href = "http://localhost:5000/api/youtube/connect";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 mt-8">
      <div className="flex items-center gap-3">
        <Video className="text-red-600" size={28} />

        <h3 className="text-xl font-semibold">
          YouTube Channel
        </h3>
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

          <button
            onClick={connectYouTube}
            className="mt-5 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
          >
            Switch YouTube Account
          </button>
        </div>
      ) : (
        <button
          onClick={connectYouTube}
          className="mt-5 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
        >
          Connect YouTube
        </button>
      )}
    </div>
  );
}

export default YouTubeConnection;
