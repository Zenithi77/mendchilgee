import { useEffect, useState } from "react";

/* Shiny "Шинэ оны мэнд" hero with a live countdown to the next New Year. */

function nextNewYear(now) {
  return new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
}

function diff(now) {
  const target = nextNewYear(now);
  let s = Math.max(0, Math.floor((target - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  return { d, h, m, s, year: target.getFullYear() };
}

const pad = (n) => String(n).padStart(2, "0");

export default function NewYearBanner({ compact = false }) {
  const [t, setT] = useState(() => diff(new Date()));

  useEffect(() => {
    const iv = setInterval(() => setT(diff(new Date())), 1000);
    return () => clearInterval(iv);
  }, []);

  const units = [
    { v: t.d, l: "өдөр" },
    { v: pad(t.h), l: "цаг" },
    { v: pad(t.m), l: "минут" },
    { v: pad(t.s), l: "секунд" },
  ];

  return (
    <section className={`ny-banner ${compact ? "ny-banner--compact" : ""}`}>
      <div className="ny-ribbon">
        <span className="ny-ribbon-bow">🎀</span>
      </div>
      <div className="ny-kicker">
        <span>❄</span> Mendchilgee · Зул сар &amp; Шинэ жил <span>❄</span>
      </div>
      <h2 className="ny-title">
        <span className="ny-title-line">Шинэ оны мэнд</span>
        <span className="ny-year">
          {String(t.year).split("").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.12}s` }}>{ch}</span>
          ))}
        </span>
      </h2>
      {!compact && (
        <p className="ny-sub">
          Хайртай хүмүүстээ гайхалтай дижитал мэндчилгээ бэлэглээрэй — 🎄 гацуур, ❄️ цас, ✨ гялбаатай.
        </p>
      )}
      <div className="ny-countdown" aria-label="Шинэ он хүртэл">
        {units.map((u) => (
          <div className="ny-cell" key={u.l}>
            <span className="ny-num" key={u.v}>{u.v}</span>
            <span className="ny-lbl">{u.l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
