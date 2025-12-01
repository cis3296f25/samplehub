import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import AuthBox from "../Components/AuthBox";
import "./Auth.css";

export default function Auth() {
  const [authMode, setAuthMode] = useState("signup");
  const { onLogin } = useOutletContext();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-page-title">SampleHub</h1>
        <AuthBox
          authMode={authMode}
          setAuthMode={setAuthMode}
          onLogin={handleLogin}
        />
      </div>
    </div>
  );
}
