import { useMemo } from "react";
import { getAvailableSectionTypes } from "../sections/sectionRegistry";
import { MdClose } from "react-icons/md";
import "./AddSectionModal.css";

/**
 * AddSectionModal — pick a section type to add.
 *
 * Props:
 *  - open:     boolean
 *  - onClose:  () => void
 *  - onSelect: (sectionType: string) => void
 */
export default function AddSectionModal({ open, onClose, onSelect }) {
  const sectionTypes = useMemo(() => getAvailableSectionTypes(), []);

  if (!open) return null;

  return (
    <div className="asm-overlay" onClick={onClose}>
      <div className="asm-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="asm-close" onClick={onClose}>
          <MdClose />
        </button>

        {/* Header */}
        <div className="asm-header">
          <span className="asm-header-emoji">✨</span>
          <h2 className="asm-title">Хуудас нэмэх</h2>
          <p className="asm-subtitle">Мэндчилгээндээ шинэ хэсэг нэмээрэй</p>
        </div>

        {/* Cards */}
        <div className="asm-cards">
          {sectionTypes.map(({ type, labelMn, descMn, icon, iconBg, iconColor }) => (
            <button
              key={type}
              className="asm-card"
              onClick={() => onSelect(type)}
            >
              <div className="asm-card-glow" style={{ background: iconBg }} />
              <div
                className="asm-card-icon"
                style={{ background: iconBg, color: iconColor }}
              >
                {icon}
              </div>
              <div className="asm-card-text">
                <h3 className="asm-card-title">{labelMn}</h3>
                <p className="asm-card-desc">{descMn}</p>
              </div>
              <div className="asm-card-arrow" style={{ color: iconColor }}>→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
