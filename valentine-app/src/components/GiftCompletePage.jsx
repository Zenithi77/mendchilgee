import { useState, useEffect, useMemo } from "react";
import "./GiftCompletePage.css";

/* ─────────────────────────────────────────────────────
   GiftCompletePage — Shown after the recipient finishes
   viewing every section of a gift. Beautiful farewell
   with branding + Instagram link.
   ───────────────────────────────────────────────────── */

const FLOATING_EMOJIS = ["💌", "✨", "🌸", "💕", "🎀", "🌹", "💖", "🦋", "🌷", "💐"];

function FloatingEmoji({ emoji, delay, left, dur }) {
  return (
    <span
      className="gc-float-emoji"
      style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${dur}s` }}
    >
      {emoji}
    </span>
  );
}

// Pre-generate random values outside component to keep render pure
const EMOJI_RANDOMS = Array.from({ length: 14 }, () => ({
  leftOffset: Math.random() * 6 - 3,
  durExtra: Math.random() * 4,
}));

export default function GiftCompletePage() {
  const [visible, setVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  const emojis = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        emoji: FLOATING_EMOJIS[i % FLOATING_EMOJIS.length],
        delay: (i * 0.7) % 6,
        left: Math.round((i / 14) * 100 + EMOJI_RANDOMS[i].leftOffset),
        dur: 6 + EMOJI_RANDOMS[i].durExtra,
      })),
    []
  );

  return (
    <div className={`gc-page ${visible ? "gc-visible" : ""}`}>
      {/* Floating emoji layer */}
      <div className="gc-emoji-layer">
        {emojis.map((e, i) => (
          <FloatingEmoji key={i} {...e} />
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="gc-orb gc-orb-1" />
      <div className="gc-orb gc-orb-2" />
      <div className="gc-orb gc-orb-3" />

      <div className={`gc-card ${showContent ? "gc-card-in" : ""}`}>
        {/* Top decoration */}
        <div className="gc-top-deco">
          <span className="gc-sparkle-icon">✨</span>
          <span className="gc-heart-icon">💌</span>
          <span className="gc-sparkle-icon">✨</span>
        </div>

        {/* Logo */}
        <div className="gc-logo">
          <span className="gc-logo-text">mendchilgee</span>
          <span className="gc-logo-dot">.site</span>
        </div>

        <div className="gc-divider">
          <span className="gc-div-line" />
          <span className="gc-div-diamond">◆</span>
          <span className="gc-div-line" />
        </div>

        {/* Main message */}
        <h1 className="gc-title font-script">
          Танд энэ мэндчилгээ <br /> очих өдрийн мэнд!
        </h1>

        <p className="gc-subtitle">
          Танд мэндчилгээ таалагдсан гэж найдаж байна 💕
        </p>

        <div className="gc-divider gc-divider-sm">
          <span className="gc-div-line" />
          <span className="gc-div-heart">♥</span>
          <span className="gc-div-line" />
        </div>

        {/* CTA - More info */}
        <p className="gc-cta-text">
          Та илүү нарийн мэдээлэл авахыг хүсвэл
        </p>

        <a
          href="https://www.instagram.com/tamirrr_b"
          target="_blank"
          rel="noopener noreferrer"
          className="gc-ig-btn"
        >
          <svg className="gc-ig-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          <span className="gc-ig-text">@tamirrr_b</span>
          <svg className="gc-ig-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>

        {/* Footer */}
        <div className="gc-footer">
          <p className="gc-footer-text">
            Хайр дүүрэн мэндчилгээ илгээгээрэй 💖
          </p>
          <a
            href="https://www.mendchilgee.site"
            target="_blank"
            rel="noopener noreferrer"
            className="gc-site-link"
          >
            www.mendchilgee.site
          </a>
        </div>

        {/* Bottom decoration */}
        <div className="gc-bottom-deco">
          🌸 · 💕 · 🌸
        </div>
      </div>
    </div>
  );
}
