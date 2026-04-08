/**
 * AcadMaid Login Page
 * Validates credentials via /auth/login, stores JWT, redirects to dashboard.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      // If user hasn't done onboarding yet, send there first
      if (!data.has_preferences) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F9FF", display: "flex",
      flexDirection: "column" }}>

      {/* Mini navbar */}
      <div className="navbar">
        <Link to="/" className="logo-container" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <span className="logo-text">AcadMaid</span>
        </Link>
        <div className="nav-buttons">
          <Link to="/signup" className="btn btn-solid">Sign Up</Link>
        </div>
      </div>

      {/* Login Card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px 16px" }}>
        <div className="card" style={{ width: "100%", maxWidth: 420 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#0A2540",
            marginBottom: 4 }}>Welcome back 👋</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
            Sign in to continue your learning journey
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14,
            color: "#6b7280" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#1E90FF", fontWeight: 600 }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}