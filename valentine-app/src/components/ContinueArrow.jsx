import { MdArrowForward } from "react-icons/md";
import "./ContinueArrow.css";

/**
 * ContinueArrow — Floating FAB arrow at the bottom-right corner.
 * Replaces the inline "Үргэлжлүүлэх" buttons across sections.
 */
export default function ContinueArrow({ onClick, label }) {
  return (
    <button
      className="continue-arrow-fab"
      onClick={onClick}
      aria-label={label || "Үргэлжлүүлэх"}
    >
      <span className="continue-arrow-ripple" />
      <MdArrowForward className="continue-arrow-icon" />
    </button>
  );
}
