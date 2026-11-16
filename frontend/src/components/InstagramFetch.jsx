
import { Camera, Search } from "lucide-react";

function InstagramFetch({
  username,
  setUsername,
  handleFetch,
  handleFetchOwn,
  loading,
  error,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="text-pink-600" size={28} />
        <h3 className="text-xl font-semibold">
          Fetch Instagram Posts
        </h3>
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

      {error && (
        <p className="text-red-600 mt-4">{error}</p>
      )}
    </div>
  );
}

export default InstagramFetch;
