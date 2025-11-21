import { auth } from "./firebaseConfig";

export default function Navbar({
  isLoggedIn,
  setIsLoggedIn,
  onUploadClick,
  onAuthClick,
  onLogoClick,
}) {
  const logout = () => {
    auth.signOut();
    setIsLoggedIn(false);
  };

  return (
    <nav className="navbar">
      <h2 className="logo" onClick={onLogoClick} style={{ cursor: "pointer" }}>
        🎵 SampleHub
      </h2>

      <div className="nav-buttons">
        {isLoggedIn ? (
          <>
            <button className="nav-btn" onClick={onUploadClick}>
              Upload
            </button>
            <button className="nav-btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <button className="nav-btn" onClick={onAuthClick}>
            Login / Sign Up
          </button>
        )}
      </div>
    </nav>
  );
}
