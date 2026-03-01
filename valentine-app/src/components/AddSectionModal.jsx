import { useMemo } from "react";
import { getAvailableSectionTypes } from "../sections/sectionRegistry";
import { FEATURE_REGISTRY } from "../config/featureRegistry";
import { TIER_META, TIERS } from "../config/tiers";
import { MdAutoAwesome, MdClose } from "react-icons/md";
import "./AddSectionModal.css";

/**
 * AddSectionModal — full-screen overlay to pick a section type.
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
      <div className="asm-container" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="asm-header">
          <div>
            <h2 className="asm-title">
              Хуудас нэмэх
              <span className="asm-title-sparkle"><MdAutoAwesome /></span>
            </h2>
            <p className="asm-subtitle">
              Өөрийн түүхээ өгүүлэх шинэ хэсэг нэмээрэй
            </p>
          </div>
          <button className="asm-close" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        {/* ── Section cards grid ── */}
        <div className="asm-body">
          <div className="asm-grid">
            {sectionTypes.map(
              ({ type, labelMn, descMn, icon, iconBg, iconColor }) => {
                const feature = FEATURE_REGISTRY[type];
                const requiredTier = feature?.requiredTier || TIERS.FREE;
                const tierMeta = TIER_META[requiredTier];

                return (
                  <button
                    key={type}
                    className="asm-card"
                    onClick={() => onSelect(type)}
                    title={
                      requiredTier !== TIERS.FREE
                        ? `Watermark-гүй нийтлэхийн тулд ${tierMeta.label} plan шаардлагатай.`
                        : undefined
                    }
                  >
                    <div
                      className="asm-card-icon"
                      style={{ background: iconBg, color: iconColor }}
                    >
                      <span>{icon}</span>
                    </div>

                    {/* ── Tier badge ── */}
                    <span
                      className="asm-tier-badge"
                      style={{
                        background: tierMeta.bgColor,
                        color: tierMeta.color,
                      }}
                    >
                      {tierMeta.badge} {tierMeta.label}
                    </span>

                    <h3 className="asm-card-title">{labelMn}</h3>
                    <p className="asm-card-desc">{descMn}</p>
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="asm-footer">
          <div className="asm-footer-hint">
            <span className="asm-footer-dot" />
            <span>Шинэ боломжууд тун удахгүй...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
