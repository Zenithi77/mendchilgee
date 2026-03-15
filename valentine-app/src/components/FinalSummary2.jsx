import { useEffect, useState } from "react";
import Confetti from "./Confetti";
import Fireworks from "./Fireworks";
import FlowerBloom from "./FlowerBloom";
import StickerAnimation from "./StickerAnimation";

export default function FinalSummary2({ choices, template, onContinue, category }) {
  const final = template?.finalSummary || {};
  const effects = template?.effects || {};
  const isMilitary = category === "soldiers-day";
  const baseSummaryFields = final.summaryFields || [];

  const mergedFields = [...baseSummaryFields];

  const hasMovieField = mergedFields.some((f) => f?.key === "movie");
  const summaryFields =
    !hasMovieField && choices?.movie
      ? [...mergedFields, { key: "movie", emoji: "🎬", label: "Кино" }]
      : mergedFields;
  const loveQuotes = final.quotes || [
    "Чамтай хамт байх мөч бүр онцгой ✨",
    "Энэ мэндчилгээ зүрхнээс ирэв 💝",
  ];
  const summaryFieldCount = summaryFields.length;

  const [meterW, setMeterW] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [revealedRows, setRevealedRows] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setMeterW(100), 600);

    const timers = Array.from({ length: summaryFieldCount }, (_, i) =>
      setTimeout(() => setRevealedRows(i + 1), 400 + i * 300),
    );

    const iv = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % loveQuotes.length);
    }, 4000);

    return () => {
      clearTimeout(t1);
      timers.forEach(clearTimeout);
      clearInterval(iv);
    };
  }, [summaryFieldCount, loveQuotes.length]);

  // Format choice value (supports arrays for multi-select)
  const formatValue = (val) => {
    if (Array.isArray(val)) {
      return val.join(", ");
    }
    return val || "—";
  };

  return (
    <div className="page page-enter">
      <Confetti active={true} colors={effects.confettiColors} />
      <Fireworks active={true} duration={6000} />
      <FlowerBloom
        active={true}
        flowers={effects.flowers}
        leafEmoji={effects.leafEmoji}
      />
      <StickerAnimation active={true} stickers={effects.stickers} count={10} />

      <div className="glass final-card">
        <div className="final-heart">{final.headerEmoji || "💝"}</div>

        <h2
          className="font-script"
          style={{
            fontSize: "2.3rem",
            color: "var(--t-primary, var(--pink))",
            marginBottom: 6,
          }}
        >
          {final.title || "Бүх зүйл бэлэн! 🎉"}
        </h2>
        <p
          style={{
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 20,
          }}
        >
          {final.subtitle || "Мэндчилгээ • mendchilgee.site"}
        </p>

        {/* Summary */}
        <div className="summary-box">
          {summaryFields.map((f, i) => (
            <div
              key={f.key}
              className="summary-row"
              style={{
                opacity: i < revealedRows ? 1 : 0,
                transform:
                  i < revealedRows ? "translateX(0)" : "translateX(-20px)",
                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <span className="sr-icon">{f.emoji}</span>
              <div>
                <div className="sr-label">{f.label}</div>
                <div className="sr-val">
                  {Array.isArray(choices[f.key]) ? (
                    <div className="sr-multi-vals">
                      {choices[f.key].map((v, vi) => (
                        <span key={vi} className="sr-tag">
                          {v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    formatValue(choices[f.key])
                  )}
                </div>
              </div>
            </div>
          ))}
          <div
            className="summary-row"
            style={{
              opacity: revealedRows >= summaryFields.length ? 1 : 0,
              transform:
                revealedRows >= summaryFields.length
                  ? "translateX(0)"
                  : "translateX(-20px)",
              transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
            }}
          >
            <span className="sr-icon">{final.dateRow?.emoji || "📅"}</span>
            <div>
              <div className="sr-label">{final.dateRow?.label || "Огноо"}</div>
              <div className="sr-val">
                {final.dateRow?.value || "2026.02.14 ❤️"}
              </div>
            </div>
          </div>
        </div>

        {/* Love Meter */}
        <div className="meter">
          <div className="meter-label">
            {final.meter?.label || "Сэрэлийн түвшин"}
          </div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${meterW}%` }} />
          </div>
          <div className="meter-text">
            {final.meter?.text || "♾️ Хязгааргүй"}
          </div>
        </div>

        {/* Rotating quote */}
        <p className="final-msg" style={{ minHeight: 80 }}>
          {loveQuotes[quoteIdx]}
        </p>

        {/* Signature */}
        <div
          className="font-vibes"
          style={{
            fontSize: "1.6rem",
            color: "var(--t-soft, var(--rose))",
            marginBottom: 8,
          }}
        >
          {final.signature || "Зүрхнээсээ"}
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.2)",
            marginTop: 20,
          }}
        >
          {final.footer || "mendchilgee.site • Made with ❤️"}
        </div>

        {/* Finish / Continue button */}
        {onContinue && (
          <button
            onClick={onContinue}
            className={isMilitary ? 'final-btn-military' : ''}
            style={{
              marginTop: 24,
              padding: '14px 36px',
              borderRadius: 60,
              border: isMilitary ? '1px solid rgba(212, 165, 74, 0.3)' : 'none',
              background: isMilitary
                ? 'linear-gradient(135deg, #1a4a7a, #2c6fad, #1a4a7a)'
                : 'linear-gradient(135deg, var(--t-primary, #ff85a2), var(--t-secondary, #ff6b9d))',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: isMilitary
                ? '0 4px 24px rgba(44, 111, 173, 0.4)'
                : '0 4px 20px rgba(255,107,157,0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              letterSpacing: isMilitary ? '0.5px' : 'normal',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              if (isMilitary) e.currentTarget.style.boxShadow = '0 8px 36px rgba(44, 111, 173, 0.55)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              if (isMilitary) e.currentTarget.style.boxShadow = '0 4px 24px rgba(44, 111, 173, 0.4)';
            }}
          >
            {isMilitary ? 'Дуусгах ⭐' : 'Дуусгах ✨'}
          </button>
        )}
      </div>
    </div>
  );
}
