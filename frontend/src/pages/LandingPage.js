/**
 * AcadMaid Landing Page
 * Converted from original HTML/CSS — preserves EXACT original structure
 *   - Navbar with logo.png + Sign In / Sign Up buttons
 *   - image-container with learn.png
 *   - image-container with path.png
 * Sign In / Sign Up now route to real auth pages via React Router.
 */

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

// ✅ Import images from src/pages/Assets
import learnImage from "./Assets/learn.png";
import pathImage from "./Assets/path.png";

export default function LandingPage() {
  return (
    <div style={{ background: "#F5F9FF", minHeight: "100vh" }}>

      {/* ── Navbar ── exact match to original HTML navbar ── */}
      <Navbar />

      {/* ── First image section: learn.png ── */}
      <div className="image-container">
        <img src={learnImage} alt="Learn" />
      </div>

      {/* ── Second image section: path.png ── */}
      <div className="image-container">
        <img src={pathImage} alt="Path" />
      </div>

    </div>
  );
}