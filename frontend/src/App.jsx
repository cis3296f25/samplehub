import { useState, useEffect } from "react";
import Navbar from "./Components/NavBar";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";
import Auth from "./Pages/Auth";
import UploadSound from "./Components/UploadSound";
import { auth } from "./Components/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import "./App.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState("home");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        setCurrentView("home");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUploadClick = () => {
    if (isLoggedIn) {
      setShowUploadModal(true);
    } else {
      setCurrentView("auth");
    }
  };

  const handleAuthClick = () => {
    setCurrentView("auth");
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView("home");
  };

  const renderContent = () => {
    if (currentView === "auth") {
      return <Auth onLogin={handleLogin} />;
    }

    if (!isLoggedIn) {
      return (
        <div className="home-layout">
          <Home />
        </div>
      );
    }

    return <Dashboard />;
  };

  return (
    <div className="app">
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        onUploadClick={handleUploadClick}
        onAuthClick={handleAuthClick}
        onLogoClick={() => setCurrentView("home")}
      />

      {renderContent()}

      {showUploadModal && isLoggedIn && (
        <UploadSound
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      <footer className="footer">
        © 2025 SampleHub • Team Joey | Shiven | Arwin | Joshua
      </footer>
    </div>
  );
}
