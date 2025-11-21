import { useState } from "react";
import AuthBox from "../Components/AuthBox";
import "./Auth.css";

export default function Auth({ onLogin }) {
  const [authMode, setAuthMode] = useState("signup");

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-page-title">🎵 SampleHub</h1>
        <AuthBox
          authMode={authMode}
          setAuthMode={setAuthMode}
          onLogin={onLogin}
        />
      </div>
    </div>
  );
}

