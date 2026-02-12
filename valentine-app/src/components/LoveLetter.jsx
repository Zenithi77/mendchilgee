import { useState, useEffect, useRef } from "react";
import YouTubeAudioPlayer from "./YouTubeAudioPlayer";

export default function LoveLetter({ letter, onClose }) {
  const [phase, setPhase] = useState("envelope"); // envelope -> opening -> letter
  const [letterVisible, setLetterVisible] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === "opening") {
      const t = setTimeout(() => {
        setPhase("letter");
        setTimeout(() => setLetterVisible(true), 200);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Start audio when letter phase begins
  useEffect(() => {
    if (phase === "letter" && letter?.music?.url) {
      setAudioPlaying(true);
      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, letter?.music?.url]);

  // Stop audio on close
  const handleClose = () => {
    setAudioPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    onClose?.();
  };

  if (!letter || !letter.enabled) return null;

  const envelope = letter.envelope || {};
  const decorations = letter.decorations || {};
  const heartTrail = letter.heartTrail || ["❤️", "💕", "💖", "💗", "💓"];
  const music = letter.music || null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="love-letter-overlay"
      onClick={() => phase === "letter" && handleClose()}
    >
      {/* Hidden YouTube audio iframe */}
      {music?.url && (
        <YouTubeAudioPlayer url={music.url} playing={audioPlaying} />
      )}

      <div
        className="love-letter-container"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "envelope" && (
          <div className="ll-envelope" onClick={() => setPhase("opening")}>
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

              {/* Music player bar - visible when audio is playing */}
              {music?.url && audioPlaying && (
                <div className="ll-music-bar">
                  <div className="ll-music-icon">
                    <span className="ll-music-eq">
                      <span className="ll-eq-bar" />
                      <span className="ll-eq-bar" />
                      <span className="ll-eq-bar" />
                      <span className="ll-eq-bar" />
                    </span>
                  </div>
                  <div className="ll-music-info">
                    <div className="ll-music-title">{music.title || "🎵 Romantic Music"}</div>
                    <div className="ll-music-progress">
                      <div className="ll-music-progress-bar">
                        <div
                          className="ll-music-progress-fill"
                          style={{ width: `${Math.min((elapsed / (music.duration || 240)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="ll-music-time">{formatTime(elapsed)}</span>
                    </div>
                  </div>
                  <button
                    className="ll-music-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAudioPlaying((p) => !p);
                    }}
                  >
                    {audioPlaying ? "⏸" : "▶️"}
                  </button>
                </div>
              )}
            </div>
            <button className="ll-close-btn" onClick={handleClose}>
              {letter.closeButtonText || "Уншлаа 💕"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
