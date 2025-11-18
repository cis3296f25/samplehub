import { useState } from "react";
import Navbar from "./Components/NavBar";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";
import AuthBox from "./Components/AuthBox";
import UploadSound from "./Components/UploadSound";
import "./App.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("signup");

  return (
    <div className="app">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      {!isLoggedIn ? (
        <div className="home-layout">
          <Home />
          <AuthBox
            authMode={authMode}
            setAuthMode={setAuthMode}
            onLogin={() => setIsLoggedIn(true)}
          />
        </div>
      ) : (
        <Dashboard />
      )}
      <UploadSound></UploadSound>

      <footer className="footer">
        © 2025 SampleHub • Team Joey | Shiven | Arwin | Joshua
      </footer>
    </div>
  );
}
