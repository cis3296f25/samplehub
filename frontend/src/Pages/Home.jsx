export default function Home() {
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
        <input type="text" placeholder="Search samples..." />

        <select>
          <option>Genre</option>
          <option>Hip-Hop</option>
          <option>EDM</option>
          <option>Pop</option>
        </select>

        <select>
          <option>BPM</option>
          <option>80–100</option>
          <option>100–120</option>
          <option>120–140</option>
        </select>

        <select>
          <option>Duration</option>
          <option>Short (&lt;10s)</option>
          <option>Medium (10–30s)</option>
          <option>Long (&gt;30s)</option>
        </select>

        <button className="search-btn">Search</button>
      </div>

      {/* Sample List */}
      <div className="samples-list">

        {/* Sample 1 with Download Button */}
        <div
          className="sample-card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Wilhelm Scream</span>

          <button
            onClick={() =>
              downloadFile(
                "https://samplehub-demo-files.s3.amazonaws.com/sample1.wav",
                "sample1.wav"
              )
            }
            style={{
              backgroundColor: "#ff006e",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "500",
            }}
          >
            Download
          </button>
        </div>

        {/* Sample 2 Placeholder */}
        <div className="sample-card">Sample #2 (Placeholder)</div>

        {/* Sample 3 Placeholder */}
        <div className="sample-card">Sample #3 (Placeholder)</div>

      </div>
    </section>
  );
}
