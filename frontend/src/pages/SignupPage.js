/**
 * AcadMaid Signup Page
 * Creates a new account via /auth/signup, then routes to onboarding.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.full_name) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup(form.email, form.password, form.full_name);
      // New users always go to onboarding
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F9FF",
      display: "flex", flexDirection: "column" }}>

      {/* Mini navbar */}
      <div className="navbar">
        <Link to="/" className="logo-container" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <span className="logo-text">AcadMaid</span>
        </Link>
        <div className="nav-buttons">
          <Link to="/login" className="btn">Sign In</Link>
        </div>
      </div>

      {/* Signup Card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px 16px" }}>
        <div className="card" style={{ width: "100%", maxWidth: 420 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#0A2540",
            marginBottom: 4 }}>Create your account 🚀</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
            Join AcadMaid and start learning smarter
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                placeholder="Your name"
                value={form.full_name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

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
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14,
            color: "#6b7280" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#1E90FF", fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}