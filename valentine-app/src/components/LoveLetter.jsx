import { useState, useEffect } from "react";

export default function LoveLetter({ letter, onClose, onMusicStart }) {
  const [phase, setPhase] = useState("envelope"); // envelope -> opening -> letter
  const [letterVisible, setLetterVisible] = useState(false);

  useEffect(() => {
    if (phase === "opening") {
      const t = setTimeout(() => {
        setPhase("letter");
        setTimeout(() => setLetterVisible(true), 200);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleOpenEnvelope = () => {
    // Start music immediately inside the click handler (user gesture)
    // so mobile browsers allow audio playback.
    if (letter?.music?.url) {
      onMusicStart?.();
    }
    setPhase("opening");
  };

  const handleClose = () => {
    // Music continues playing — managed by GiftRenderer
    onClose?.();
  };

  if (!letter) return null;

  // If letter has 'enabled' field explicitly set to false, skip
  if (letter.enabled === false) return null;

  const envelope = letter.envelope || {};
  const decorations = letter.decorations || {};
  const heartTrail = letter.heartTrail || ["❤️", "💕", "💖", "💗", "💓"];

  return (
    <div
      className="love-letter-overlay"
      onClick={() => phase === "letter" && handleClose()}
    >
      <div
        className="love-letter-container"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "envelope" && (
          <div className="ll-envelope" onClick={handleOpenEnvelope}>
            <div className="ll-envelope-body">
              <div className="ll-envelope-flap" />
              <div className="ll-envelope-front">
                <span className="ll-envelope-heart">
                  {envelope.emoji || "💌"}
                </span>
                <p className="ll-envelope-text">
                  {envelope.text || "Нээж үзээрэй..."}
                </p>
              </div>
            </div>
            <div className="ll-envelope-sparkles">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="ll-sparkle"
                  style={{
                    "--delay": `${i * 0.3}s`,
                    "--x": `${20 + Math.random() * 60}%`,
                    "--y": `${20 + Math.random() * 60}%`,
                  }}
                >
                  {envelope.sparkleEmoji || "✨"}
                </span>
              ))}
            </div>
          </div>
        )}

        {phase === "opening" && (
          <div className="ll-envelope ll-opening">
            <div className="ll-envelope-body">
              <div className="ll-envelope-flap ll-flap-open" />
              <div className="ll-letter-peek" />
            </div>
          </div>
        )}

        {phase === "letter" && (
          <div
            className={`ll-letter ${letterVisible ? "ll-letter-visible" : ""}`}
          >
            <div className="ll-letter-paper">
              <div className="ll-letter-decoration ll-deco-top">
                {decorations.top || "💕"}
              </div>
              <h2 className="ll-letter-title">{letter.title}</h2>
              <div className="ll-letter-divider">
                <span>{decorations.divider || "♥"}</span>
              </div>
              <p className="ll-letter-content">{letter.content}</p>
              <div className="ll-letter-signature">
                <span className="ll-heart-trail">
                  {heartTrail.map((h, i) => (
                    <span key={i} className="ll-sig-heart" style={{ "--i": i }}>
                      {h}
                    </span>
                  ))}
                </span>
              </div>
              <div className="ll-letter-decoration ll-deco-bottom">
                {decorations.bottom || "🌹"}
              </div>
            </div>
            <button className="ll-close-btn" onClick={handleClose}>
              {letter.closeButtonText || "Уншлаа ✨"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
