/**
 * AcadMaid Dashboard Page
 * Shows: greeting, preferences summary, progress bars, quick links.
 * Fetches progress summary and user preferences from the backend.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || "#0A2540" }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ProgressSection({ label, pct }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0A2540" }}>
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1E90FF" }}>
          {pct}%
        </span>
      </div>
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [prefs, setPrefs] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prefsRes, summaryRes] = await Promise.all([
          API.get("/preferences/"),
          API.get("/progress/summary"),
        ]);
        setPrefs(prefsRes.data);
        setSummary(summaryRes.data);
      } catch {
        // Preferences might not exist yet — that's fine
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Learner";

  return (
    <div style={{ minHeight: "100vh", background: "#F5F9FF" }}>
      <Navbar />

      <div className="page-container">

        {/* ── Greeting ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0A2540" }}>
            Hey, {firstName}! 👋
          </h1>
          <p style={{ color: "#6b7280", marginTop: 4, fontSize: 15 }}>
            Ready to learn something great today?
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : (
          <>
            {/* ── Preference summary banner ── */}
            {prefs ? (
              <div style={{
                background: "linear-gradient(90deg, #0A2540, #1E90FF)",
                borderRadius: 12,
                padding: "20px 28px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 28,
              }}>
                <div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>Currently studying</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>
                    {prefs.subject}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.85, marginTop: 2 }}>
                    {prefs.skill_level} level · Confidence {prefs.confidence}/5
                  </div>
                </div>
                <Link to="/onboarding" style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  padding: "8px 18px",
                  borderRadius: 50,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}>
                  Change Topic
                </Link>
              </div>
            ) : (
              /* First time — no preferences set */
              <div style={{
                background: "linear-gradient(90deg, #0A2540, #1E90FF)",
                borderRadius: 12,
                padding: "24px 28px",
                color: "white",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    🎯 Set up your learning preferences
                  </div>
                  <div style={{ opacity: 0.85, fontSize: 14, marginTop: 4 }}>
                    Tell us what you want to learn to get personalized recommendations
                  </div>
                </div>
                <Link to="/onboarding" style={{
                  background: "white",
                  color: "#0A2540",
                  padding: "10px 20px",
                  borderRadius: 50,
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: 14,
                }}>
                  Get Started →
                </Link>
              </div>
            )}

            {/* ── Stats Row ── */}
            {summary && (
              <div style={{ display: "flex", gap: 16, marginBottom: 28,
                flexWrap: "wrap" }}>
                <StatCard icon="📹" label="Videos Watched"
                  value={summary.videos_completed} color="#1E90FF" />
                <StatCard icon="✅" label="Topics Done"
                  value={summary.topics_completed} color="#10b981" />
                <StatCard icon="📈" label="Overall Progress"
                  value={`${summary.overall_percentage}%`} color="#f59e0b" />
              </div>
            )}

            {/* ── Progress Bars ── */}
            {summary && (
              <div className="card" style={{ marginBottom: 28 }}>
                <h2 className="section-title" style={{ marginBottom: 20 }}>
                  📊 Your Progress
                </h2>
                <ProgressSection label="Videos Completed"
                  pct={summary.video_percentage} />
                <ProgressSection label="Topics Completed"
                  pct={summary.topic_percentage} />
                <ProgressSection label="Overall"
                  pct={summary.overall_percentage} />
              </div>
            )}

            {/* ── Quick Action Cards ── */}
            <h2 className="section-title">Quick Actions</h2>
            <div style={{ display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16, marginBottom: 28 }}>

              {[
                { icon: "📹", title: "Watch Videos",
                  desc: "Curated YouTube content for your level",
                  link: "/recommendations", color: "#EBF5FF" },
                { icon: "🗓️", title: "Learning Plan",
                  desc: "Generate your day-by-day study schedule",
                  link: "/plan", color: "#ECFDF5" },
                { icon: "⚙️", title: "Update Preferences",
                  desc: "Change subject or skill level",
                  link: "/onboarding", color: "#FFF7ED" },
              ].map((action) => (
                <Link key={action.title} to={action.link}
                  style={{ textDecoration: "none" }}>
                  <div className="card" style={{
                    background: action.color,
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    height: "100%",
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{action.icon}</div>
                    <div style={{ fontWeight: 700, color: "#0A2540",
                      fontSize: 16, marginBottom: 6 }}>{action.title}</div>
                    <div style={{ fontSize: 13, color: "#6b7280",
                      lineHeight: 1.5 }}>{action.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}