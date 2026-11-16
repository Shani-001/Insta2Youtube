
import { LoaderCircle } from "lucide-react";

function ManualUpload({
  videoFile,
  setVideoFile,
  manualTitle,
  setManualTitle,
  manualDescription,
  setManualDescription,
  handleManualUpload,
  manualUploading,
  manualMessage,
  youtubeConnected,
}) {
  return (
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
        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2"
      >
        {manualUploading && (
          <LoaderCircle className="animate-spin" size={20} />
        )}

        {manualUploading ? "Uploading Video..." : "Upload to YouTube"}
      </button>

      {manualUploading && (
        <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <LoaderCircle
              className="animate-spin text-red-600"
              size={28}
            />

            <div>
              <p className="font-semibold text-red-700">
                Your video is uploading to YouTube
              </p>

              <p className="text-sm text-red-600">
                Please wait. Do not close this page.
              </p>
            </div>
          </div>
        </div>
      )}

      {manualMessage && (
        <p className="mt-4 text-sm text-slate-700 break-all">
          {manualMessage}
        </p>
      )}
    </div>
  );
}

export default ManualUpload;
