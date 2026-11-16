
import { RefreshCw, Video } from "lucide-react";

function UploadHistory({
  uploadHistory,
  fetchUploadHistory,
  historyLoading,
  historyError,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 mt-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5">
        <h3 className="text-xl font-semibold">
          YouTube Upload History
        </h3>

        <button
          onClick={fetchUploadHistory}
          disabled={historyLoading}
          className="bg-slate-800 text-white px-5 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <RefreshCw
            size={18}
            className={historyLoading ? "animate-spin" : ""}
          />
          {historyLoading ? "Loading..." : "Refresh History"}
        </button>
      </div>

      {historyError && (
        <p className="text-red-600 mb-4">{historyError}</p>
      )}

      {historyLoading ? (
        <p className="text-slate-500">Loading upload history...</p>
      ) : uploadHistory.length === 0 && !historyError ? (
        <p className="text-slate-500">
          Click Refresh History to view your uploads.
        </p>
      ) : (
        <div className="space-y-4">
          {uploadHistory.map((item) => (
            <div
              key={item._id}
              className="border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-2">
                <Video className="text-red-600" size={22} />

                <h4 className="font-semibold text-slate-800">
                  {item.videoTitle}
                </h4>
              </div>

              <p className="text-sm text-slate-500 mt-2">
                Source: {item.source || "Not available"}
              </p>

              <p className="text-sm text-slate-500">
                Status: {item.status}
              </p>

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
      )}
    </div>
  );
}

export default UploadHistory;
