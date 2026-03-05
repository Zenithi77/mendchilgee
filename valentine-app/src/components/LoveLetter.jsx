import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ContinueArrow from "./ContinueArrow";

/* ─────────────────────────────────────────────────────
   LoveLetter — Dreamy cinematic envelope → letter reveal
   ───────────────────────────────────────────────────── */
export default function LoveLetter({ letter, onClose, onMusicStart }) {
  const [phase, setPhase] = useState("envelope");
  // envelope → glow → sealBreak → flap → rise → letterIn
  const [letterVisible, setLetterVisible] = useState(false);
  const [sealBroken, setSealBroken] = useState(false);
  const [showLightBurst, setShowLightBurst] = useState(false);
  const [contentRevealed, setContentRevealed] = useState(false);

  /* ── Burst particles (emoji confetti on open) ── */
  const particles = useMemo(() => {
    const emojis = ["✨", "💕", "🌸", "💫", "⭐", "🦋", "🌹", "💖", "🩷", "💐", "🎀", "🪷"];
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: 30 + Math.random() * 40,      // cluster near center
      y: 30 + Math.random() * 40,
      size: 0.7 + Math.random() * 0.8,
      delay: Math.random() * 0.8,
      dur: 1.8 + Math.random() * 2.2,
      dx: -120 + Math.random() * 240,
      dy: -160 + Math.random() * 80,
      rot: Math.random() * 520 - 260,
    }));
  }, []);

  /* ── Falling petals (continuous ambient) ── */
  const petals = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: ["🌸", "🩷", "💮", "🪻"][i % 4],
      left: Math.random() * 100,
      delay: Math.random() * 8,
      dur: 6 + Math.random() * 7,
      size: 0.6 + Math.random() * 0.6,
      sway: 30 + Math.random() * 60,
    })), []);

  /* ── Phase machine ── */
  useEffect(() => {
    const timers = [];
    if (phase === "glow") {
      timers.push(setTimeout(() => {
        setSealBroken(true);
        setPhase("sealBreak");
      }, 500));
    }
    if (phase === "sealBreak") {
      timers.push(setTimeout(() => {
        setShowLightBurst(true);
        setPhase("flap");
      }, 650));
    }
    if (phase === "flap") {
      timers.push(setTimeout(() => setPhase("rise"), 1000));
    }
    if (phase === "rise") {
      timers.push(setTimeout(() => {
        setPhase("letterIn");
        setTimeout(() => setLetterVisible(true), 120);
        setTimeout(() => setContentRevealed(true), 600);
      }, 900));
    }
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const handleOpenEnvelope = useCallback(() => {
    if (letter?.music?.url) onMusicStart?.();
    setPhase("glow"); // adds a pre-glow before breaking seal
  }, [letter, onMusicStart]);

  const handleClose = () => onClose?.();

  if (!letter) return null;
  if (letter.enabled === false) return null;

  const envelope = letter.envelope || {};
  const decorations = letter.decorations || {};
  const heartTrail = letter.heartTrail || ["❤️", "💕", "💖", "💗", "💓"];
  const isOpening = ["glow", "sealBreak", "flap", "rise"].includes(phase);

  return (
    <div
      className="love-letter-overlay"
      onClick={() => phase === "letterIn" && handleClose()}
    >
      {/* ── Ambient falling petals (always visible) ── */}
      <div className="ll-petal-rain">
        {petals.map((p) => (
          <span
            key={p.id}
            className="ll-petal"
            style={{
              "--left": `${p.left}%`,
              "--delay": `${p.delay}s`,
              "--dur": `${p.dur}s`,
              "--size": p.size,
              "--sway": `${p.sway}px`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* ── Light burst on seal break ── */}
      {showLightBurst && <div className="ll-light-burst" />}

      {/* ── Burst particles on open ── */}
      {(isOpening || phase === "letterIn") && (
        <div className="ll-particles">
          {particles.map((p) => (
            <span
              key={p.id}
              className="ll-particle"
              style={{
                "--px": `${p.x}%`,
                "--py": `${p.y}%`,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--rot": `${p.rot}deg`,
                "--size": p.size,
                "--delay": `${p.delay}s`,
                "--dur": `${p.dur}s`,
              }}
            >
              {p.emoji}
            </span>
          ))}
        </div>
      )}

      <div className="love-letter-container" onClick={(e) => e.stopPropagation()}>

        {/* ══════ ENVELOPE PHASE ══════ */}
        {(phase === "envelope" || isOpening) && (
          <div
            className={`ll-envelope ${isOpening ? "ll-opening" : ""} ${phase === "glow" ? "ll-glowing" : ""}`}
            onClick={phase === "envelope" ? handleOpenEnvelope : undefined}
          >
            {/* 3D Scene */}
            <div className="ll-env-scene">
              <div className="ll-env-3d">
                <div className="ll-env-back">
                  {/* Embossed heart watermark */}
                  <div className="ll-env-watermark">♥</div>
                </div>

                {/* Letter peeking inside */}
                <div className={`ll-env-letter-inside ${phase === "rise" ? "ll-env-letter-rising" : ""}`}>
                  <div className="ll-env-letter-lines">
                    <span /><span /><span /><span />
                  </div>
                </div>

                {/* Front face */}
                <div className="ll-env-front">
                  {/* Decorative ribbon */}
                  <div className="ll-ribbon">
                    <div className="ll-ribbon-left" />
                    <div className="ll-ribbon-right" />
                  </div>

                  {/* Wax seal */}
                  <div className={`ll-wax-seal ${sealBroken ? "ll-seal-broken" : ""} ${phase === "glow" ? "ll-seal-glowing" : ""}`}>
                    <span className="ll-seal-emoji">{envelope.emoji || "💌"}</span>
                    <div className="ll-seal-shine" />
                    <div className="ll-seal-ring" />
                    {sealBroken && (
                      <>
                        <span className="ll-seal-crack ll-crack-1" />
                        <span className="ll-seal-crack ll-crack-2" />
                        <span className="ll-seal-crack ll-crack-3" />
                      </>
                    )}
                  </div>
                </div>

                {/* Top flap */}
                <div className={`ll-env-flap ${phase === "flap" || phase === "rise" ? "ll-flap-opened" : ""}`}>
                  <div className="ll-env-flap-inner" />
                </div>

                {/* Side flaps */}
                <div className="ll-env-side-l" />
                <div className="ll-env-side-r" />
              </div>
            </div>

            {/* Invitation text with hand icon */}
            {phase === "envelope" && (
              <div className="ll-env-tap-area">
                <span className="ll-tap-hand">👆</span>
                <p className="ll-env-tap-text">
                  {envelope.text || "Нээж үзээрэй..."}
                </p>
              </div>
            )}

            {/* Ambient sparkles around envelope */}
            {phase === "envelope" && (
              <div className="ll-env-sparkles">
                {[...Array(12)].map((_, i) => (
                  <span
                    key={i}
                    className="ll-sparkle"
                    style={{
                      "--delay": `${i * 0.3}s`,
                      "--x": `${5 + Math.random() * 90}%`,
                      "--y": `${5 + Math.random() * 90}%`,
                      "--scale": 0.6 + Math.random() * 0.8,
                    }}
                  >
                    {["✨", "💫", "⭐"][i % 3]}
                  </span>
                ))}
              </div>
            )}

            {/* Glowing halo behind envelope */}
            <div className="ll-env-glow" />
          </div>
        )}

        {/* ══════ LETTER PHASE ══════ */}
        {phase === "letterIn" && (
          <div className={`ll-letter ${letterVisible ? "ll-letter-visible" : ""}`}>
            <div className="ll-letter-paper">
              {/* Ornate border frame */}
              <div className="ll-ornate-border" />

              {/* Decorative corner flourishes */}
              <div className="ll-corner ll-corner-tl">❦</div>
              <div className="ll-corner ll-corner-tr">❦</div>
              <div className="ll-corner ll-corner-bl">❦</div>
              <div className="ll-corner ll-corner-br">❦</div>

              {/* Top emoji decoration */}
              <div className="ll-letter-decoration ll-deco-top">
                {decorations.top || "💕"}
              </div>

              {/* Title with shimmer */}
              <h2 className="ll-letter-title">
                <span className="ll-title-text">{letter.title}</span>
              </h2>

              {/* Ornate divider */}
              <div className="ll-letter-divider">
                <span className="ll-divider-line ll-divider-line-l" />
                <span className="ll-divider-diamond">◆</span>
                <span className="ll-divider-icon">{decorations.divider || "♥"}</span>
                <span className="ll-divider-diamond">◆</span>
                <span className="ll-divider-line ll-divider-line-r" />
              </div>

              {/* Letter content with staggered reveal */}
              <div className={`ll-letter-content-wrap ${contentRevealed ? "ll-content-revealed" : ""}`}>
                <p className="ll-letter-content">{letter.content}</p>
              </div>

              {/* Signature hearts */}
              <div className="ll-letter-signature">
                <div className="ll-sig-line" />
                <span className="ll-heart-trail">
                  {heartTrail.map((h, i) => (
                    <span key={i} className="ll-sig-heart" style={{ "--i": i }}>
                      {h}
                    </span>
                  ))}
                </span>
              </div>

              {/* Bottom emoji decoration */}
              <div className="ll-letter-decoration ll-deco-bottom">
                {decorations.bottom || "🌹"}
              </div>

              <ContinueArrow onClick={handleClose} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
