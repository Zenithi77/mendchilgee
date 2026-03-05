import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { optimizedVideoUrl } from "../services/cloudinaryService";

/* ─── Floating sparkle particle ────────────────────────────── */
function Sparkle({ delay, left }) {
  return (
    <div
      className="mv-sparkle"
      style={{ left: `${left}%`, animationDelay: `${delay}s` }}
    />
  );
}

/**
 * MemoryVideo — cinematic premium video player.
 * Features: animated gradient border, floating sparkles, film-strip
 * thumbnails, custom cinematic controls, swipe navigation, reflection.
 */
export default function MemoryVideo({ data, onContinue, onMusicPause }) {
  const videos = data?.videos || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState("next"); // "next" | "prev"
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const controlsTimer = useRef(null);
  const touchStartX = useRef(null);

  // Sparkles (memoized)
  const sparkles = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({
      delay: (i * 0.6) % 4,
      left: Math.round((i / 12) * 100 + Math.random() * 8),
    })),
    [],
  );

  const goTo = useCallback(
    (idx, dir) => {
      if (idx >= 0 && idx < videos.length && idx !== currentIdx) {
        setDirection(dir || (idx > currentIdx ? "next" : "prev"));
        setTransitioning(true);
        setTimeout(() => {
          setCurrentIdx(idx);
          setPlaying(false);
          setProgress(0);
          setTransitioning(false);
        }, 300);
      }
    },
    [currentIdx, videos.length],
  );

  const current = videos[currentIdx];

  /* ─── Video events ─── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setProgress(v.currentTime);
      setDuration(v.duration || 0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      if (currentIdx < videos.length - 1) {
        setTimeout(() => goTo(currentIdx + 1, "next"), 800);
      }
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, [currentIdx, videos.length, goTo]);

  /* ─── Auto-hide controls ─── */
  const bumpControls = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    bumpControls();
    v.muted = false;
    if (v.paused) {
      // Pause background music when video starts playing
      if (onMusicPause) onMusicPause();
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const seekTo = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
  };

  /* ─── Touch swipe navigation ─── */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(diff) > 50) {
      if (diff < 0 && currentIdx < videos.length - 1) goTo(currentIdx + 1, "next");
      else if (diff > 0 && currentIdx > 0) goTo(currentIdx - 1, "prev");
    }
  };

  const fmtTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  /* ─── Empty state ─── */
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

  const animClass = transitioning
    ? direction === "next" ? "mv-card-out-left" : "mv-card-out-right"
    : direction === "next" ? "mv-card-in-right" : "mv-card-in-left";

  return (
    <div className="page page-enter">
      <div className="mv-container">
        {/* Floating sparkles */}
        <div className="mv-sparkle-layer">
          {sparkles.map((s, i) => (
            <Sparkle key={i} delay={s.delay} left={s.left} />
          ))}
        </div>

        {/* Header */}
        <div className="mv-header">
          <div className="mv-header-icon">
            <span className="mv-film-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="url(#mvGrad)" strokeWidth="1.5"/>
                <rect x="2" y="4" width="4" height="4" stroke="url(#mvGrad)" strokeWidth="1" opacity="0.5"/>
                <rect x="2" y="12" width="4" height="4" stroke="url(#mvGrad)" strokeWidth="1" opacity="0.5"/>
                <rect x="18" y="4" width="4" height="4" stroke="url(#mvGrad)" strokeWidth="1" opacity="0.5"/>
                <rect x="18" y="12" width="4" height="4" stroke="url(#mvGrad)" strokeWidth="1" opacity="0.5"/>
                <polygon points="10,8 10,16 16,12" fill="url(#mvGrad)"/>
                <defs>
                  <linearGradient id="mvGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="var(--t-primary, #ff85a2)"/>
                    <stop offset="100%" stopColor="var(--t-secondary, #ff6b9d)"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </div>
          <h2 className="font-script mv-header-title">
            {data?.title || "Дурсамж бичлэг"}
          </h2>
          {videos.length > 1 && (
            <div className="mv-header-count">
              {videos.map((_, i) => (
                <span key={i} className={`mv-header-pip ${i === currentIdx ? "active" : ""}`} />
              ))}
            </div>
          )}
        </div>

        {/* Animated gradient border wrapper */}
        <div className="mv-border-glow">
          <div
            className={`mv-card ${animClass}`}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseMove={bumpControls}
          >
            {/* Cinematic player */}
            <div className="mv-player" onClick={togglePlay}>
              {current?.src ? (
                <>
                  {/* Letterbox bars */}
                  <div className="mv-letterbox mv-letterbox-top" />
                  <div className="mv-letterbox mv-letterbox-bottom" />

                  <video
                    ref={videoRef}
                    key={current.src}
                    src={optimizedVideoUrl(current.src, { width: 960, quality: "auto" })}
                    playsInline
                    className="mv-video"
                  />

                  {/* Play overlay with ripple */}
                  <div className={`mv-play-overlay ${playing && !showControls ? "mv-hidden" : ""}`}>
                    <div className="mv-play-ring">
                      <div className="mv-play-btn">
                        {playing ? (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                            <rect x="6" y="4" width="4" height="16" rx="1.5" />
                            <rect x="14" y="4" width="4" height="16" rx="1.5" />
                          </svg>
                        ) : (
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cinematic gradient overlay on bottom */}
                  <div className="mv-vignette" />
                </>
              ) : (
                <div className="mv-placeholder">
                  <span>🎬</span>
                  <p>Бичлэг оруулаагүй</p>
                </div>
              )}
            </div>

            {/* Controls bar */}
            {current?.src && (
              <div className={`mv-controls ${!showControls && playing ? "mv-controls-hidden" : ""}`}>
                <button
                  className="mv-ctrl-btn"
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                >
                  {playing ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <span className="mv-time">{fmtTime(progress)}</span>
                <div className="mv-progress-bar" onClick={seekTo}>
                  <div className="mv-progress-fill" style={{ width: `${pct}%` }}>
                    <div className="mv-progress-thumb" />
                  </div>
                  <div className="mv-progress-glow" style={{ width: `${pct}%` }} />
                </div>
                <span className="mv-time">{fmtTime(duration)}</span>
                <button
                  className="mv-ctrl-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted(!muted);
                  }}
                >
                  {muted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* Caption & date */}
            {(current?.caption || current?.date) && (
              <div className="mv-info">
                {current.caption && (
                  <p className="font-script mv-caption">{current.caption}</p>
                )}
                {current.date && (
                  <p className="mv-date">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:4,verticalAlign:-1}}>
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                    </svg>
                    {current.date}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Film strip thumbnails */}
        {videos.length > 1 && (
          <div className="mv-filmstrip">
            {videos.map((v, i) => (
              <button
                key={i}
                className={`mv-thumb ${i === currentIdx ? "active" : ""}`}
                onClick={() => goTo(i, i > currentIdx ? "next" : "prev")}
              >
                <span className="mv-thumb-num">{i + 1}</span>
                {i === currentIdx && <span className="mv-thumb-playing">▶</span>}
              </button>
            ))}
          </div>
        )}

        {/* Navigation arrows */}
        {videos.length > 1 && (
          <div className="mv-nav">
            <button
              className="mv-nav-arrow"
              disabled={currentIdx === 0}
              onClick={() => goTo(currentIdx - 1, "prev")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <span className="mv-nav-label">
              {currentIdx + 1} / {videos.length}
            </span>
            <button
              className="mv-nav-arrow"
              disabled={currentIdx === videos.length - 1}
              onClick={() => goTo(currentIdx + 1, "next")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
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
