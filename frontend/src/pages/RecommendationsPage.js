/**
 * AcadMaid Recommendations Page
 * Fetches video recommendations from backend based on user preferences.
 * Users can mark videos as watched to track progress.
 */

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";

function VideoCard({ video, completed, onToggle }) {
  return (
    <div className="card" style={{
      display: "flex",
      flexDirection: "column",
      gap: 0,
      padding: 0,
      overflow: "hidden",
      transition: "transform 0.15s, box-shadow 0.15s",
      position: "relative",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "none"}>

      {/* Completed badge */}
      {completed && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "#10b981", color: "white",
          borderRadius: 50, width: 28, height: 28,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, zIndex: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}>✓</div>
      )}

      {/* Thumbnail — links to YouTube */}
      <a href={video.url} target="_blank" rel="noopener noreferrer">
        <div style={{ position: "relative" }}>
          <img
            src={video.thumbnail}
            alt={video.title}
            style={{ width: "100%", height: 180, objectFit: "cover",
              display: "block" }}
            onError={e => {
              // Fallback if thumbnail fails to load
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          {/* Fallback placeholder */}
          <div style={{ display: "none", height: 180, background: "#EBF5FF",
            alignItems: "center", justifyContent: "center", fontSize: 40 }}>
            📹
          </div>
          {/* Play overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}>
            <div style={{
              width: 50, height: 50, borderRadius: "50%",
              background: "rgba(255,0,0,0.85)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "white", fontSize: 18, marginLeft: 3 }}>▶</span>
            </div>
          </div>
        </div>
      </a>

      {/* Info */}
      <div style={{ padding: "14px 16px", flex: 1,
        display: "flex", flexDirection: "column", gap: 8 }}>
        <a href={video.url} target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: "none" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A2540",
            lineHeight: 1.4, margin: 0 }}>
            {video.title}
          </h3>
        </a>
        <div style={{ fontSize: 12, color: "#6b7280" }}>📺 {video.channel}</div>

        <button
          onClick={() => onToggle(video)}
          style={{
            marginTop: "auto",
            padding: "8px",
            border: `2px solid ${completed ? "#10b981" : "#1E90FF"}`,
            borderRadius: 8,
            background: completed ? "#ECFDF5" : "#EBF5FF",
            color: completed ? "#10b981" : "#1E90FF",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "inherit",
          }}>
          {completed ? "✓ Watched" : "Mark as Watched"}
        </button>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const [videos, setVideos] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [meta, setMeta] = useState({ subject: "", skill_level: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch recommendations and current progress in parallel
        const [recRes, progRes] = await Promise.all([
          API.get("/recommendations/"),
          API.get("/progress/"),
        ]);

        setVideos(recRes.data.videos || []);
        setMeta({
          subject: recRes.data.subject,
          skill_level: recRes.data.skill_level,
        });

        // Build a set of completed video IDs for quick lookup
        const done = new Set(
          progRes.data.progress
            .filter(p => p.completed && p.item_type === "video")
            .map(p => p.item_id)
        );
        setCompletedIds(done);
      } catch (err) {
        setError(err.response?.data?.detail ||
          "Could not load videos. Please complete onboarding first.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggle = async (video) => {
    const wasCompleted = completedIds.has(video.id);
    // Optimistic update
    const newSet = new Set(completedIds);
    wasCompleted ? newSet.delete(video.id) : newSet.add(video.id);
    setCompletedIds(newSet);

    try {
      await API.post("/progress/mark", {
        item_id: video.id,
        item_type: "video",
        item_title: video.title,
        completed: !wasCompleted,
      });
    } catch {
      // Revert on failure
      setCompletedIds(completedIds);
    }
  };

  const watchedCount = videos.filter(v => completedIds.has(v.id)).length;
  const pct = videos.length ? Math.round((watchedCount / videos.length) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F9FF" }}>
      <Navbar />

      <div className="page-container">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="section-title" style={{ marginBottom: 4 }}>
            📹 Recommended Videos
          </h1>
          {meta.subject && (
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              Curated for <strong>{meta.subject}</strong> ·{" "}
              <strong>{meta.skill_level}</strong> level
            </p>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
            <p style={{ marginTop: 16, color: "#6b7280" }}>
              Loading your videos...
            </p>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <>
            {/* Progress bar */}
            {videos.length > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: "#0A2540" }}>
                    Videos Watched
                  </span>
                  <span style={{ fontWeight: 700, color: "#1E90FF" }}>
                    {watchedCount} / {videos.length} ({pct}%)
                  </span>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}

            {/* Video grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}>
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  completed={completedIds.has(video.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>

            {videos.length === 0 && (
              <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                <p>No videos found. Please complete onboarding to get recommendations.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}