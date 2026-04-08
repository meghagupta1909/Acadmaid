/**
 * AcadMaid Learning Plan Page
 * Lets users set hours/day and duration, then generates a day-wise plan.
 * Users can mark individual days as complete to track progress.
 */

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";

function DayCard({ day, completed, completedTopics, onToggleTopic }) {
  const allDone = day.topics.every((_, i) =>
    completedTopics.has(`day-${day.day}-topic-${i}`)
  );

  return (
    <div className="card" style={{
      borderLeft: `4px solid ${allDone ? "#10b981" : "#1E90FF"}`,
      transition: "transform 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "none"}>

      {/* Day header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 800, color: "#0A2540", fontSize: 16 }}>
            Day {day.day}
          </span>
          <span style={{ marginLeft: 10, fontSize: 12, color: "#6b7280",
            background: "#F5F9FF", padding: "2px 8px", borderRadius: 20 }}>
            ⏱ {day.hours}h
          </span>
        </div>
        {allDone && (
          <span style={{ color: "#10b981", fontWeight: 700, fontSize: 13 }}>
            ✓ Done
          </span>
        )}
      </div>

      {/* Topics list with checkboxes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {day.topics.map((topic, i) => {
          const key = `day-${day.day}-topic-${i}`;
          const isDone = completedTopics.has(key);
          return (
            <div key={i}
              onClick={() => onToggleTopic(key, topic, isDone)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", padding: "6px 8px",
                borderRadius: 6,
                background: isDone ? "#ECFDF5" : "transparent",
                transition: "background 0.15s",
              }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${isDone ? "#10b981" : "#d1d5db"}`,
                background: isDone ? "#10b981" : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isDone && <span style={{ color: "white", fontSize: 11,
                  fontWeight: 800 }}>✓</span>}
              </div>
              <span style={{
                fontSize: 14, color: isDone ? "#10b981" : "#374151",
                textDecoration: isDone ? "line-through" : "none",
                fontWeight: isDone ? 500 : 400,
              }}>
                {topic}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlanPage() {
  const [plan, setPlan] = useState(null);
  const [meta, setMeta] = useState(null);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Form state for generating a new plan
  const [hours, setHours] = useState(2);
  const [days, setDays] = useState(30);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    try {
      // Try to load existing plan and progress
      const [planRes, progRes] = await Promise.all([
        API.get("/plan/"),
        API.get("/progress/"),
      ]);

      setPlan(planRes.data.plan);
      setMeta({
        subject: planRes.data.subject,
        skill_level: planRes.data.skill_level,
        hours_per_day: planRes.data.hours_per_day,
        num_days: planRes.data.num_days,
        total_topics: planRes.data.total_topics,
      });

      // Restore completed topics from backend
      const done = new Set(
        progRes.data.progress
          .filter(p => p.completed && p.item_type === "topic")
          .map(p => p.item_id)
      );
      setCompletedTopics(done);
    } catch {
      // No plan yet — show the creation form
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await API.post("/plan/", {
        hours_per_day: parseFloat(hours),
        num_days: parseInt(days),
      });
      setPlan(res.data.plan);
      setMeta({
        subject: res.data.subject,
        skill_level: res.data.skill_level,
        hours_per_day: res.data.hours_per_day,
        num_days: res.data.num_days,
        total_topics: res.data.total_topics,
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.detail ||
        "Failed to generate plan. Please complete onboarding first.");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTopic = async (key, title, wasDone) => {
    // Optimistic update
    const newSet = new Set(completedTopics);
    wasDone ? newSet.delete(key) : newSet.add(key);
    setCompletedTopics(newSet);

    try {
      await API.post("/progress/mark", {
        item_id: key,
        item_type: "topic",
        item_title: title,
        completed: !wasDone,
      });
    } catch {
      setCompletedTopics(completedTopics);
    }
  };

  // Calculate overall plan completion
  const totalTopics = plan
    ? plan.reduce((acc, d) => acc + d.topics.length, 0)
    : 0;
  const doneCount = completedTopics.size;
  const pct = totalTopics ? Math.round((doneCount / totalTopics) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F9FF" }}>
      <Navbar />

      <div className="page-container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap",
          gap: 12 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 4 }}>
              🗓️ Learning Plan
            </h1>
            {meta && (
              <p style={{ color: "#6b7280", fontSize: 15 }}>
                <strong>{meta.subject}</strong> · {meta.skill_level} ·{" "}
                {meta.hours_per_day}h/day · {meta.num_days} days
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn"
            style={{
              background: "linear-gradient(90deg, #0A2540, #1E90FF)",
              border: "none", color: "white",
            }}>
            {showForm ? "Cancel" : "✏️ New Plan"}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : (
          <>
            {/* ── Plan generation form ── */}
            {showForm && (
              <div className="card" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A2540",
                  marginBottom: 16 }}>
                  Generate Your Learning Plan
                </h2>

                {error && <div className="alert alert-error">{error}</div>}

                <div style={{ display: "grid",
                  gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Hours per day: <strong>{hours}h</strong></label>
                    <input type="range" min={0.5} max={8} step={0.5}
                      value={hours}
                      onChange={e => setHours(parseFloat(e.target.value))}
                      style={{ accentColor: "#1E90FF" }} />
                    <div style={{ display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12, color: "#6b7280" }}>
                      <span>0.5h</span><span>8h</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Number of days: <strong>{days} days</strong></label>
                    <input type="range" min={7} max={90} step={1}
                      value={days}
                      onChange={e => setDays(parseInt(e.target.value))}
                      style={{ accentColor: "#1E90FF" }} />
                    <div style={{ display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12, color: "#6b7280" }}>
                      <span>1 week</span><span>3 months</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, padding: 12,
                  background: "#F5F9FF", borderRadius: 8,
                  fontSize: 14, color: "#6b7280" }}>
                  📊 Total commitment:{" "}
                  <strong style={{ color: "#0A2540" }}>
                    {(hours * days).toFixed(0)} hours
                  </strong>{" "}
                  over <strong style={{ color: "#0A2540" }}>{days} days</strong>
                </div>

                <button className="submit-btn" style={{ marginTop: 16 }}
                  disabled={generating} onClick={generatePlan}>
                  {generating ? "Generating..." : "🚀 Generate My Plan"}
                </button>
              </div>
            )}

            {/* ── Plan progress bar ── */}
            {plan && !showForm && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: "#0A2540" }}>
                    Plan Completion
                  </span>
                  <span style={{ fontWeight: 700, color: "#1E90FF" }}>
                    {doneCount} / {totalTopics} topics ({pct}%)
                  </span>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}

            {/* ── Day cards grid ── */}
            {plan && !showForm && (
              <div style={{ display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16 }}>
                {plan.map((day) => (
                  <DayCard
                    key={day.day}
                    day={day}
                    completedTopics={completedTopics}
                    onToggleTopic={handleToggleTopic}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!plan && !showForm && (
              <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <p>No plan yet. Click "New Plan" to get started!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}