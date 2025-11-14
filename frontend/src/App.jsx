import React, { useState } from "react";
import { auth } from "./firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import "./App.css";

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      setSubmitted(true);

      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo"> SampleHub</h2>

        <button
          onClick={() => setShowDashboard(!showDashboard)}
          className="nav-btn"
        >
          {showDashboard ? "🏠 Home" : "📂 Dashboard"}
        </button>
      </nav>

      {/*  Home Page */}
      {!showDashboard ? (
        <main className="home-layout">

          {/* Left Section */}
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

            {/* Sample Items */}
            <div className="samples-list">
              <div className="sample-card">Sample #1 (Placeholder)</div>
              <div className="sample-card">Sample #2 (Placeholder)</div>
              <div className="sample-card">Sample #3 (Placeholder)</div>
            </div>
          </section>

          {/* Right Section */}
          <section className="right-section">
            <h2 className="signup-title">Join SampleHub</h2>

            {submitted ? (
              <p className="thank-you">✅ Thank you for signing up!</p>
            ) : (
              <form className="signup-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button type="submit">Sign Up</button>
              </form>
            )}

            {error && <p className="error">{error}</p>}
          </section>

        </main>
      ) : (
        <section className="dashboard">
          <h2>📂 My Dashboard</h2>
          <p>This is where saved samples will appear.</p>
        </section>
      )}

      <footer className="footer">
        © 2025 SampleHub • Team Joey | Shiven | Arwin | Joshua
      </footer>
    </div>
  );
}

export default App;