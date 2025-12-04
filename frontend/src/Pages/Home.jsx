import { useState, useEffect } from "react";

export default function Home() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  const [favorites, setFavorites] = useState([]);
  const [pack_samples, setPack] = useState([]);

  const userId = 1; //PLACEHOLDER FOR USER ID
  const packId = 1;

  useEffect(() => {
    fetchSample();
    fetchFavorites();
    fetchAddedPack();
  }, []);

  // SAMPLE FETCHING FUNCTION
  const fetchSample = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/samples");
      const data = await response.json();
      setSamples(data);
    } catch (error) {
      console.error("Error fetching samples:", error);
    } finally {
      setLoading(false);
    }
  };

  // FAVORITE FETCHING FUNCTION
  const fetchFavorites = async () => {
    try {
      const response = await fetch(`/api/favorites/${userId}`);
      const data = await response.json();
      setFavorites(data.map((fav) => fav.sample_id));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };
  const fetchAddedPack = async () => {
    try {
      const response = await fetch(`/api/sample_packs/${userId}`);
      const data = await response.json();
      setPack(data.map((pack) => pack.sample_id));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  // SEARCH HANDLER
  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (selectedGenre) params.append("genre", selectedGenre);

      const response = await fetch(`/api/samples/search?${params}`);
      const data = await response.json();
      setSamples(data);
    } catch (error) {
      console.error("Error searching samples:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (sampleId) => {
    const isFavorited = favorites.includes(sampleId);

    try {
      if (isFavorited) {
        await fetch(`/api/favorites?userId=${userId}&sampleId=${sampleId}`, {
          method: "DELETE",
        });

        setFavorites(favorites.filter((id) => id !== sampleId));
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, sampleId }),
        });
        setFavorites([...favorites, sampleId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const AddToPack = async (sampleId) => {
    alert("adding the sample to the pack");
    await fetch("/api/pack_samples", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ packId, sampleId })
    });

    setPack([...pack_samples, sampleId]);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  };
  // Force file download helper
  const downloadFile = (url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="left-section">
      <h1 className="main-title">
        Find, preview, and collect samples — all in one place.
      </h1>

      {/* Search Controls */}
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search samples..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">Genre</option>
          <option value="Hip-Hop">Hip-Hop</option>
          <option value="EDM">EDM</option>
          <option value="POP">Pop</option>
        </select>

        <select
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(e.target.value)}
        >
          <option value="">Duration</option>
          <option value="short">Short (&lt;10s)</option>
          <option value="medium">Medium (10–30s)</option>
          <option value="long">Long (&gt;30s)</option>
        </select>

        <button className="search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Sample List */}
      <div className="samples-list">
        {loading ? (
          <div className="loading">Loading samples...</div>
        ) : samples.length === 0 ? (
          <div className="no-samples">No samples found.</div>
        ) : (
          samples.map((sample) => (
            <div key={sample.id} className="sample-card">
              <div className="sample-header">
                <h3>{sample.title}</h3>
                {sample.genre && (
                  <span className="genre-tag">{sample.genre}</span>
                )}
                <button
                  className="add-to-pack-btn"
                  onClick={() => AddToPack(sample.id)}
                >
                  Add to Pack
                </button>
                <button
                  className="fav-btn"
                  onClick={() => toggleFavorite(sample.id)}
                >
                  {favorites.includes(sample.id) ? "❤️" : "🤍"}
                </button>
              </div>

              <div className="sample-info">
                <span>Duration: {formatDuration(sample.duration)}</span>
                {sample.file_size && (
                  <span>Size: {formatFileSize(sample.file_size)}</span>
                )}
              </div>

              {sample.preview_url && (
                <audio controls className="audio-player">
                  <source src={sample.preview_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
