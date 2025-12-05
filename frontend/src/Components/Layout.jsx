import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./NavBar";
import UploadSound from "./UploadSound";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleUploadClick = () => {
    if (isLoggedIn) {
      setShowUploadModal(true);
    } else {
      navigate("/auth");
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/");
  };

  return (
    <div className="app">
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        onUploadClick={handleUploadClick}
      />

      <Outlet context={{ onLogin: handleLogin }} />

      {showUploadModal && isLoggedIn && (
        <UploadSound
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      <footer className="footer">© 2025 SampleHub</footer>
    </div>
  );
}
