import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Login from "./Login";
import { auth } from "./firebaseConfig";

export default function AuthBox({ authMode, setAuthMode, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const signup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const u = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(u.user, { displayName: name });
      setSubmitted(true);

      setName("");
      setEmail("");
      setPassword("");

      if (onLogin) {
        onLogin();
      }
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="right-section">
      <h2 className="signup-title">
        {authMode === "signup" ? "Join SampleHub" : "Login to SampleHub"}
      </h2>

      {submitted && authMode === "signup" ? (
        <p className="thank-you">Thank you for signing up!</p>
      ) : authMode === "signup" ? (
        <>
          <form className="signup-form" onSubmit={signup}>
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

          <button className="switch-btn" onClick={() => setAuthMode("login")}>
            Already have an account? Login
          </button>
        </>
      ) : (
        <>
          <Login onLoginSuccess={onLogin} />

          <button className="switch-btn" onClick={() => setAuthMode("signup")}>
            Don't have an account? Sign Up
          </button>
        </>
      )}

      {error && <p className="error">{error}</p>}
    </section>
  );
}
