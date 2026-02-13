// ═══════════════════════════════════════════════════════════════
// Watermark — Semi-transparent overlay for unpaid/expired gifts
// ═══════════════════════════════════════════════════════════════
//
// Renders a non-removable watermark on the public gift view.
// Multiple layers prevent simple CSS removal.
//
// Show when: requiredTier > paidTier OR paymentExpired === true
// Hide when: paidTier >= requiredTier AND not expired
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Watermark.css";

const BRAND_URL = "https://bolzii.com";

// Generate repeating watermark text nodes for diagonal pattern
function generatePatternTexts(count = 80) {
  const texts = [];
  for (let i = 0; i < count; i++) {
    texts.push(
      <span key={i} className="watermark-pattern-text">
        bolzii.com
      </span>,
    );
  }
  return texts;
}

/**
 * Watermark component
 *
 * @param {boolean} visible — whether to show the watermark
 */
export default function Watermark({ visible, giftId }) {
  const navigate = useNavigate();
  const patternTexts = useMemo(() => generatePatternTexts(80), []);

  if (!visible) return null;

  return (
    <>
      {/* Full-page overlay with diagonal pattern and bottom banner */}
      <div
        className="watermark-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          pointerEvents: "auto",
        }}
        data-watermark="bolzii"
      >
        {/* Diagonal repeating pattern */}
        <div className="watermark-pattern">{patternTexts}</div>

        {/* Bottom banner with CTA */}
        <div className="watermark-banner" style={{ pointerEvents: "auto" }}>
          <p className="watermark-banner-text">
            Бүтээсэн{" "}
            <a
              href={BRAND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="watermark-banner-brand"
            >
              bolzii.com
            </a>
            {" · "}
            Watermark арилгахын тулд upgrade хийнэ үү
          </p>
          <button
            className="watermark-banner-cta"
            onClick={() => {
              if (giftId) {
                navigate(`/builder/${giftId}?upgrade=true`);
              } else {
                window.open(BRAND_URL, "_blank");
              }
            }}
          >
            Upgrade хийх →
          </button>
        </div>
      </div>

      {/* Corner brand badge — separate fixed element for resilience */}
      <div
        className="watermark-corner"
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 100000,
          pointerEvents: "none",
        }}
        data-watermark="corner"
      >
        <span className="watermark-corner-text">bolzii.com</span>
      </div>
    </>
  );
}
