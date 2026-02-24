import { useEffect, useRef, useState, useCallback } from "react";

export default function MemoryGallery2({ memories, onContinue, template }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const gallery = template?.memoryGallery || {};
  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const total = memories.length;

  const goToSlide = useCallback(
    (idx) => {
      setCurrentSlide(Math.max(0, Math.min(idx, total - 1)));
      setTouchDelta(0);
    },
    [total],
  );

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStart === null) return;
    const delta = e.touches[0].clientX - touchStart;
    setTouchDelta(delta);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (Math.abs(touchDelta) > 60) {
      if (touchDelta < 0 && currentSlide < total - 1) {
        goToSlide(currentSlide + 1);
      } else if (touchDelta > 0 && currentSlide > 0) {
        goToSlide(currentSlide - 1);
      } else {
        setTouchDelta(0);
      }
    } else {
      setTouchDelta(0);
    }
    setTouchStart(null);
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e) => {
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (touchStart === null || !isDragging) return;
    const delta = e.clientX - touchStart;
    setTouchDelta(delta);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(touchDelta) > 60) {
      if (touchDelta < 0 && currentSlide < total - 1) {
        goToSlide(currentSlide + 1);
      } else if (touchDelta > 0 && currentSlide > 0) {
        goToSlide(currentSlide - 1);
      } else {
        setTouchDelta(0);
      }
    } else {
      setTouchDelta(0);
    }
    setTouchStart(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") goToSlide(currentSlide - 1);
      if (e.key === "ArrowRight") goToSlide(currentSlide + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSlide, goToSlide]);

  const translateX =
    -(currentSlide * 100) + (touchDelta / (window.innerWidth || 400)) * 100;

  return (
    <div className="page page-enter">
      <div className="swipe-gallery-container">
        {/* Header */}
        <div className="gallery-header-2">
          <div
            className="gallery-header-icon"
            style={{
              animation:
                gallery.headerIconAnimation || "bearLove 1.5s ease infinite",
            }}
          >
            {gallery.headerIcon || "💝"}
          </div>
          <h2 className="font-script gallery-header-title">
            {gallery.headerTitle || "Бидний дурсамжууд"}
          </h2>
          {/* <p className="gallery-header-hint">
            ← Зүүн, баруун тийш шударна уу →
          </p> */}
        </div>

        {/* Swipe area */}
        <div
          className="swipe-viewport"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="swipe-track"
            ref={trackRef}
            style={{
              transform: `translateX(${translateX}%)`,
              transition: isDragging
                ? "none"
                : "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {memories.map((mem, i) => (
              <div className="swipe-slide" key={i}>
                <div
                  className={`swipe-card${i === currentSlide ? " active" : ""}`}
                >
                  <div className="swipe-card-img">
                    {mem.src ? (
                      mem.type === "video" ? (
                        <video src={mem.src} controls playsInline loop muted />
                      ) : (
                        <img
                          src={mem.src}
                          alt={mem.caption}
                          loading="lazy"
                          draggable={false}
                        />
                      )
                    ) : (
                      <div className="swipe-placeholder">
                        <div className="swipe-placeholder-icon">
                          {mem.placeholder}
                        </div>
                        <div className="swipe-placeholder-hint">
                          {gallery.placeholderHint || "Зургаа энд нэмнэ үү"}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="swipe-card-info">
                    <div className="swipe-card-date">{mem.date}</div>
                    <div className="swipe-card-caption font-script">
                      {mem.caption}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="swipe-dots">
          {memories.map((_, i) => (
            <button
              key={i}
              className={`swipe-dot${i === currentSlide ? " active" : ""}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>

        {/* Nav arrows */}
        <div className="swipe-arrows">
          <button
            className="swipe-arrow left"
            onClick={() => goToSlide(currentSlide - 1)}
            disabled={currentSlide === 0}
          >
            ‹
          </button>
          <button
            className="swipe-arrow right"
            onClick={() => goToSlide(currentSlide + 1)}
            disabled={currentSlide === total - 1}
          >
            ›
          </button>
        </div>

        {/* Counter */}
        <div className="swipe-counter">
          {currentSlide + 1} / {total}
        </div>

        {/* Continue */}
        <div className="gallery-continue-2">
          <p
            className="font-script"
            style={{
              fontSize: "1.2rem",
              color: "rgba(255,255,255,0.5)",
              marginBottom: 20,
            }}
          >
            {gallery.footerText || "Бидний хамтдаа өнгрүүлэх дурсамж бүхэн үнэ цэнэтэй... 💕"}
          </p>
          <button className="btn btn-magic" onClick={onContinue}>
            {gallery.continueButton || "Болзоо төлөвлөх 👩‍❤️‍👨"}
          </button>
        </div>
      </div>
    </div>
  );
}
