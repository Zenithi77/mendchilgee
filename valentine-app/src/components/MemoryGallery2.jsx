import { useEffect, useRef, useState, useCallback } from "react";
import ContinueArrow from "./ContinueArrow";

const BAR_COUNT = 40;

export default function MemoryGallery2({
  memories,
  onContinue,
  template,
  musicPlaying,
  onMusicPause,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const gallery = template?.memoryGallery || {};
  const total = memories.length;
  const autoRef = useRef(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const videoRefs = useRef({});

  /* ── Auto-advance photos when music is playing ── */
  useEffect(() => {
    if (musicPlaying && total > 1) {
      autoRef.current = setInterval(
        () => setCurrentSlide((p) => (p + 1) % total),
        5000,
      );
    } else if (autoRef.current) {
      clearInterval(autoRef.current);
    }
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [musicPlaying, total]);

  const goTo = useCallback(
    (idx) => {
      const next = ((idx % total) + total) % total;
      setCurrentSlide(next);
      /* reset auto timer on manual navigation */
      if (autoRef.current) clearInterval(autoRef.current);
      if (musicPlaying && total > 1) {
        autoRef.current = setInterval(
          () => setCurrentSlide((p) => (p + 1) % total),
          5000,
        );
      }
    },
    [total, musicPlaying],
  );

  /* ── Touch swipe ── */
  const onTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) goTo(currentSlide + (diff < 0 ? 1 : -1));
    setTouchStartX(null);
  };

  /* ── Keyboard ── */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowLeft") goTo(currentSlide - 1);
      if (e.key === "ArrowRight") goTo(currentSlide + 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [currentSlide, goTo]);

  /* ── Waveform bar properties (generated once) ── */
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => ({
      delay: (Math.random() * 1.4).toFixed(2),
      speed: (0.35 + Math.random() * 0.8).toFixed(2),
      maxH: Math.round(10 + Math.random() * 38),
    })),
  ).current;

  return (
    <div className="page page-enter">
      <div className="music-box-gallery">
        {/* ── header ── */}
        <div className="music-box-header">
          <div
            className="music-box-header-icon"
            style={{
              animation:
                gallery.headerIconAnimation || "bearLove 1.5s ease infinite",
            }}
          >
            {gallery.headerIcon || "💝"}
          </div>
          <h2 className="font-script music-box-title">
            {gallery.headerTitle || "Бидний дурсамжууд"}
          </h2>
        </div>

        {/* ── photo frame ── */}
        <div
          className={`music-box-frame${musicPlaying ? " playing" : ""}`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* stacked photos — crossfade */}
          <div className="music-box-photos">
            {memories.map((m, i) => (
              <div
                key={i}
                className={`music-box-slide${i === currentSlide ? " active" : ""}`}
              >
                {m.src ? (
                  m.type === "video" ? (
                    <video
                      ref={(el) => { if (el) videoRefs.current[i] = el; }}
                      src={m.src}
                      controls
                      playsInline
                      loop
                      onPlay={() => { if (onMusicPause) onMusicPause(); }}
                    />
                  ) : (
                    <img
                      src={m.src}
                      alt={m.caption}
                      loading="lazy"
                      draggable={false}
                    />
                  )
                ) : (
                  <div className="music-box-placeholder">
                    <span className="music-box-ph-icon">{m.placeholder}</span>
                    <span className="music-box-ph-hint">
                      {gallery.placeholderHint || "Зургаа энд нэмнэ үү"}
                    </span>
                  </div>
                )}
                {/* caption gradient overlay */}
                <div className="music-box-overlay">
                  {m.date && <span className="music-box-date">{m.date}</span>}
                  {m.caption && (
                    <span className="music-box-caption font-script">
                      {m.caption}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* now-playing badge */}
          {musicPlaying && (
            <div className="music-box-badge">
              <span className="music-box-disc">💿</span>
              <span>Тоглуулж байна</span>
            </div>
          )}

          {/* counter */}
          <div className="music-box-counter">
            {currentSlide + 1} / {total}
          </div>

          {/* ── arrows inside frame ── */}
          <button
            className="music-box-arrow music-box-arrow-left"
            onClick={() => goTo(currentSlide - 1)}
          >
            ‹
          </button>
          <button
            className="music-box-arrow music-box-arrow-right"
            onClick={() => goTo(currentSlide + 1)}
          >
            ›
          </button>
        </div>

        {/* ── waveform visualiser ── */}
        <div
          className={`music-box-waveform${musicPlaying ? " playing" : ""}`}
        >
          {bars.map((b, i) => (
            <span
              key={i}
              className="wb"
              style={{
                "--d": `${b.delay}s`,
                "--s": `${b.speed}s`,
                "--h": `${b.maxH}px`,
              }}
            />
          ))}
        </div>

        {/* ── dots ── */}
        <div className="music-box-dots">
          {memories.map((_, i) => (
            <button
              key={i}
              className={`music-box-dot${i === currentSlide ? " active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* ── footer ── */}
        <div className="music-box-footer">
          <p className="font-script music-box-footer-text">
            {gallery.footerText || "Бидний дурсамж бүхэн үнэ цэнэтэй... ✨"}
          </p>
          <ContinueArrow onClick={onContinue} />
        </div>
      </div>
    </div>
  );
}
