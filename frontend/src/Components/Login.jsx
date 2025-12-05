import { useState } from "react";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      onLoginSuccess();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <form className="signup-form" onSubmit={login}>
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
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        required
      />

      <button type="submit">Login</button>

      {err && <p className="error">Invalid email or password</p>}
    </form>
  );
}
