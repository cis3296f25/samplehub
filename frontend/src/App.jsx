import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AuthBox from "./components/AuthBox";
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

      <footer className="footer">© 2025 SampleHub • Team Joey | Shiven | Arwin | Joshua</footer>
    </div>
  );
}
