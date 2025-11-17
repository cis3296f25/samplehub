import { auth } from "./firebaseConfig";


export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const logout = () => {
    auth.signOut();
    setIsLoggedIn(false);
  };

  return (
    <nav className="navbar">
      <h2 className="logo">🎵 SampleHub</h2>

      {isLoggedIn && (
        <button className="nav-btn" onClick={logout}>
          Logout
        </button>
      )}
    </nav>
  );
}
