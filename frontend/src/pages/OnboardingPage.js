/**
 * AcadMaid Onboarding Page
 * 3-step wizard that collects user's subject, skill level, and confidence.
 * Saves preferences to backend then routes to dashboard.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const SUBJECTS = [
  { value: "Python", icon: "🐍", label: "Python" },
  { value: "Web Dev", icon: "🌐", label: "Web Dev" },
  { value: "Java", icon: "☕", label: "Java" },
  { value: "AI/ML", icon: "🤖", label: "AI / ML" },
  { value: "Data Science", icon: "📊", label: "Data Science" },
  { value: "DSA", icon: "🧩", label: "DSA" },
];

const LEVELS = [
  { value: "Beginner", icon: "🌱", desc: "Just starting out" },
  { value: "Intermediate", icon: "🚀", desc: "Know the basics" },
  { value: "Advanced", icon: "⚡", desc: "Ready for depth" },
];

export default function OnboardingPage() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState({
    subject: "",
    skill_level: "",
    confidence: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await API.post("/preferences/", prefs);
      updateUser({ has_preferences: true });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.round((step / 3) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F9FF",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "40px 16px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span style={{ fontSize: 40 }}>🎓</span>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0A2540",
          marginTop: 8 }}>Let's personalize your learning</h1>
        <p style={{ color: "#6b7280", marginTop: 6 }}>Step {step} of 3</p>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 500, marginBottom: 28 }}>
        <div className="progress-bar-wrapper">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="card" style={{ width: "100%", maxWidth: 500 }}>
        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Step 1: Choose Subject ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A2540",
              marginBottom: 6 }}>What do you want to learn?</h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
              Pick the topic you're most excited about
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 12 }}>
              {SUBJECTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setPrefs({ ...prefs, subject: s.value })}
                  style={{
                    padding: "16px 12px",
                    border: `2px solid ${prefs.subject === s.value ? "#1E90FF" : "#e5e7eb"}`,
                    borderRadius: 10,
                    background: prefs.subject === s.value ? "#EBF5FF" : "white",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 28 }}>{s.icon}</span>
                  <span style={{ fontWeight: 600, color: "#0A2540",
                    fontSize: 14 }}>{s.label}</span>
                </button>
              ))}
            </div>
            <button
              className="submit-btn"
              style={{ marginTop: 24 }}
              disabled={!prefs.subject}
              onClick={() => setStep(2)}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Step 2: Skill Level ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A2540",
              marginBottom: 6 }}>What's your skill level in {prefs.subject}?</h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
              Be honest — this helps us recommend the right content
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setPrefs({ ...prefs, skill_level: l.value })}
                  style={{
                    padding: "16px 20px",
                    border: `2px solid ${prefs.skill_level === l.value ? "#1E90FF" : "#e5e7eb"}`,
                    borderRadius: 10,
                    background: prefs.skill_level === l.value ? "#EBF5FF" : "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "left",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 28 }}>{l.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0A2540",
                      fontSize: 15 }}>{l.value}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{l.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button className="submit-btn" style={{ background: "#e5e7eb",
                color: "#0A2540", flex: 1 }} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="submit-btn" style={{ flex: 2 }}
                disabled={!prefs.skill_level} onClick={() => setStep(3)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confidence Slider ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A2540",
              marginBottom: 6 }}>How confident do you feel?</h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>
              Rate your confidence in {prefs.subject} from 1 (low) to 5 (high)
            </p>

            {/* Confidence display */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 56 }}>
                {["😟", "😐", "🙂", "😊", "🤩"][prefs.confidence - 1]}
              </span>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0A2540",
                marginTop: 8 }}>
                {["Not confident at all", "Slightly confident",
                  "Moderately confident", "Quite confident",
                  "Very confident!"][prefs.confidence - 1]}
              </div>
            </div>

            <input
              type="range"
              min={1} max={5}
              value={prefs.confidence}
              onChange={(e) => setPrefs({ ...prefs,
                confidence: parseInt(e.target.value) })}
              style={{ width: "100%", accentColor: "#1E90FF", height: 6,
                cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between",
              fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              <span>1 - Low</span><span>5 - High</span>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <button className="submit-btn" style={{ background: "#e5e7eb",
                color: "#0A2540", flex: 1 }} onClick={() => setStep(2)}>
                ← Back
              </button>
              <button className="submit-btn" style={{ flex: 2 }}
                disabled={loading} onClick={handleSubmit}>
                {loading ? "Saving..." : "Start Learning 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}