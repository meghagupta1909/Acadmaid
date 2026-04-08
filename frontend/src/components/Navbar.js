/**
 * Navbar Component
 * Shows logo + auth buttons on public pages,
 * or logo + nav links + logout on protected pages.
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="navbar">
      {/* Logo — clicking takes you home or to dashboard */}
      <Link to={user ? "/dashboard" : "/"} className="logo-container">
        {/* Original logo image — matches your assets/logo.png */}
        <img
          src="/assets/logo.png"
          className="logo-img"
          alt="AcadMaid Logo"
          onError={(e) => { e.target.style.display = "none"; }} // hide if image missing
        />
        <span className="logo-text">AcadMaid</span>
      </Link>

      <div className="nav-buttons">
        {user ? (
          // Logged-in navigation
          <>
            <Link to="/dashboard" className="btn">Dashboard</Link>
            <Link to="/recommendations" className="btn">Videos</Link>
            <Link to="/plan" className="btn">My Plan</Link>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginLeft: 6 }}>
              Hi, {user.full_name || user.email.split("@")[0]}
            </span>
            <button onClick={handleLogout} className="btn btn-solid">Logout</button>
          </>
        ) : (
          // Public navigation
          <>
            <Link to="/login" className="btn">Sign In</Link>
            <Link to="/signup" className="btn btn-solid">Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}