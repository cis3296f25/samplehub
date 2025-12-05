import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import logo from "./favicon-48x48.png";

export default function Navbar({ isLoggedIn, setIsLoggedIn, onUploadClick }) {
  const navigate = useNavigate();

  const logout = () => {
    auth.signOut();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img src={logo} alt="Logo" />
        <h2 className="logo" style={{ cursor: "pointer", marginLeft: "7px" }}>
          SampleHub
        </h2>
      </Link>

      <div className="nav-buttons">
        <Link
          to="/discover"
          className="nav-btn"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          Discover
        </Link>
        {isLoggedIn ? (
          <>
            <button className="nav-btn" onClick={onUploadClick}>
              Upload
            </button>
            <Link
              to="/dashboard"
              className="nav-btn"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              Dashboard
            </Link>
            <button className="nav-btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="nav-btn"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Login / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}
