export default function Home() {
  return (
    <section className="left-section">
      <h1 className="main-title">
        Find, preview, and collect samples — all in one place.
      </h1>

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

      <div className="samples-list">
        <div className="sample-card">Sample #1 (Placeholder)</div>
        <div className="sample-card">Sample #2 (Placeholder)</div>
        <div className="sample-card">Sample #3 (Placeholder)</div>
      </div>
    </section>
  );
}
