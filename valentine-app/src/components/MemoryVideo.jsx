import { useState } from "react";

/**
 * MemoryVideo — displays a list of uploaded memory videos with captions.
 * Videos are played inline. User can swipe or click through them.
 */
export default function MemoryVideo({ data, onContinue }) {
  const videos = data?.videos || [];
  const [currentIdx, setCurrentIdx] = useState(0);

  const goTo = (idx) => {
    if (idx >= 0 && idx < videos.length) setCurrentIdx(idx);
  };

  const current = videos[currentIdx];

  if (videos.length === 0) {
    return (
      <div className="page page-enter">
        <div className="glass" style={{ padding: 40, textAlign: "center", maxWidth: 500 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎬</div>
          <h2 className="font-script" style={{ color: "var(--t-primary, var(--pink))", marginBottom: 12 }}>
            {data?.title || "Дурсамж бичлэг"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Бичлэг оруулаагүй байна</p>
          {onContinue && (
            <button className="btn btn-magic" style={{ marginTop: 24 }} onClick={onContinue}>
              Үргэлжлүүлэх ✨
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page page-enter">
      <div className="mv-container">
        {/* Header */}
        <div className="mv-header">
          <div className="mv-header-icon">🎬</div>
          <h2 className="font-script mv-header-title">
            {data?.title || "Дурсамж бичлэг"}
          </h2>
        </div>

        {/* Video player */}
        <div className="mv-player">
          {current?.src ? (
            <video
              key={current.src}
              src={current.src}
              controls
              playsInline
              autoPlay
              className="mv-video"
            />
          ) : (
            <div className="mv-placeholder">
              <span>🎬</span>
              <p>Бичлэг оруулаагүй</p>
            </div>
          )}
        </div>

        {/* Caption */}
        {current?.caption && (
          <p className="font-script mv-caption">{current.caption}</p>
        )}
        {current?.date && (
          <p className="mv-date">{current.date}</p>
        )}

        {/* Dots */}
        {videos.length > 1 && (
          <div className="mv-dots">
            {videos.map((_, i) => (
              <button
                key={i}
                className={`mv-dot ${i === currentIdx ? "active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}

        {/* Navigation */}
        {videos.length > 1 && (
          <div className="mv-nav">
            <button
              className="mv-nav-btn"
              disabled={currentIdx === 0}
              onClick={() => goTo(currentIdx - 1)}
            >
              ‹ Өмнөх
            </button>
            <span className="mv-counter">{currentIdx + 1} / {videos.length}</span>
            <button
              className="mv-nav-btn"
              disabled={currentIdx === videos.length - 1}
              onClick={() => goTo(currentIdx + 1)}
            >
              Дараах ›
            </button>
          </div>
        )}

        {/* Continue */}
        {onContinue && (
          <div className="mv-continue">
            <button className="btn btn-magic" onClick={onContinue}>
              {data?.continueButton || "Үргэлжлүүлэх ✨"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
