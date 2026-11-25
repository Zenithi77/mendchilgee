import { useEffect, useMemo, useRef, useState } from "react";
import "./ChristmasDecor.css";

/*
  ChristmasDecor — Vegas Gold (#C5B358) Christmas / Шинэ жил layer.
  Purely decorative: fixed, pointer-events: none, sits behind page content.
  Pieces:
    • gold shimmer sweep + twinkling star field
    • CSS snowfall
    • floating Christmas emojis (replaces the old floating hearts)
    • string of glowing bulbs along the top
    • swinging shiny ornaments hanging from the top
    • glowing SVG Christmas tree + snow drift at the bottom
    • sparkle trail that follows the cursor / finger
*/

const XMAS_EMOJIS = [
  "🎄", "🎅", "❄️", "🎁", "⛄", "🔔", "🦌", "⭐", "🍬", "🧦", "🎀", "✨", "🤶", "🍪", "🕯️",
];

const rand = (min, max) => min + Math.random() * (max - min);

// 10 downward swags across a 1000×40 box; each dips 12px at its midpoint.
const WIRE_PATH =
  "M0 6 " + Array.from({ length: 10 }, (_, i) => `Q ${i * 100 + 50} 30 ${(i + 1) * 100} 6`).join(" ");

const BULB_COLORS =["#ff3b3b", "#2ee66b", "#ffd84a", "#3bb8ff", "#ff6bd6"];
const ORNAMENTS = [
  { left: 6, len: 70, color: "#b3122e", size: 38, delay: 0 },
  { left: 14, len: 120, color: "#0f6b3a", size: 30, delay: -1.2 },
  { left: 23, len: 50, color: "#e8d27a", size: 26, delay: -0.6 },
  { left: 77, len: 60, color: "#e8d27a", size: 28, delay: -0.9 },
  { left: 86, len: 115, color: "#b3122e", size: 34, delay: -1.6 },
  { left: 94, len: 75, color: "#0f6b3a", size: 40, delay: -0.3 },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return reduced;
}

function FloatingXmas({ emojis }) {
  const list = emojis?.length ? emojis : XMAS_EMOJIS;
  const [items, setItems] = useState([]);
  const id = useRef(0);

  useEffect(() => {
    const timers = new Set();
    const iv = setInterval(() => {
      const i = id.current++;
      setItems((prev) => [
        ...prev,
        {
          id: i,
          emoji: list[Math.floor(Math.random() * list.length)],
          left: rand(0, 100),
          size: rand(16, 40),
          dur: rand(12, 24),
          sway: rand(20, 70) * (Math.random() > 0.5 ? 1 : -1),
        },
      ]);
      const t = setTimeout(() => {
        setItems((prev) => prev.filter((h) => h.id !== i));
        timers.delete(t);
      }, 26000);
      timers.add(t);
    }, 700);
    return () => {
      clearInterval(iv);
      timers.forEach(clearTimeout);
    };
  }, [list]);

  return (
    <div className="xmas-float-layer">
      {items.map((h) => (
        <span
          key={h.id}
          className="xmas-float"
          style={{
            left: `${h.left}%`,
            fontSize: h.size,
            animationDuration: `${h.dur}s`,
            "--sway": `${h.sway}px`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

function SparkleTrail() {
  const layer = useRef(null);
  useEffect(() => {
    let last = 0;
    const glyphs = ["✦", "✧", "❄", "★", "•"];
    const spawn = (x, y, burst = 1) => {
      const el = layer.current;
      if (!el) return;
      for (let k = 0; k < burst; k++) {
        const s = document.createElement("span");
        s.className = "xmas-trail";
        s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        s.style.left = `${x}px`;
        s.style.top = `${y}px`;
        s.style.setProperty("--dx", `${rand(-40, 40)}px`);
        s.style.setProperty("--dy", `${rand(10, 60)}px`);
        s.style.fontSize = `${rand(8, 18)}px`;
        s.style.color = Math.random() > 0.3 ? "#fff6c9" : "#ffffff";
        el.appendChild(s);
        setTimeout(() => s.remove(), 900);
      }
    };
    const onMove = (e) => {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      const p = e.touches ? e.touches[0] : e;
      spawn(p.clientX, p.clientY, 1);
    };
    const onDown = (e) => {
      const p = e.touches ? e.touches[0] : e;
      spawn(p.clientX, p.clientY, 10);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);
  return <div ref={layer} className="xmas-trail-layer" />;
}

function XmasTree() {
  const lights = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const row = Math.floor(rand(0, 1) * 5);
        const y = 60 + row * 38 + rand(-8, 8);
        const halfW = 18 + row * 18;
        return {
          cx: 100 + rand(-halfW, halfW),
          cy: y,
          c: BULB_COLORS[i % BULB_COLORS.length],
          d: rand(0, 2),
        };
      }),
    [],
  );
  return (
    <svg className="xmas-tree" viewBox="0 0 200 280" aria-hidden="true">
      <defs>
        <linearGradient id="xt-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f8a4c" />
          <stop offset="1" stopColor="#0b4a27" />
        </linearGradient>
        <radialGradient id="xt-star" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset="1" stopColor="#ffd84a" />
        </radialGradient>
      </defs>
      <rect x="88" y="240" width="24" height="34" rx="3" fill="#6b3e1d" />
      <polygon points="100,30 150,110 50,110" fill="url(#xt-g)" />
      <polygon points="100,70 170,170 30,170" fill="url(#xt-g)" />
      <polygon points="100,120 190,245 10,245" fill="url(#xt-g)" />
      <path d="M58 100 Q100 125 142 98" className="xmas-tree-tinsel" />
      <path d="M44 160 Q100 190 158 158" className="xmas-tree-tinsel" />
      <path d="M26 232 Q100 262 176 230" className="xmas-tree-tinsel" />
      {lights.map((l, i) => (
        <circle
          key={i}
          cx={l.cx}
          cy={l.cy}
          r="4.2"
          fill={l.c}
          className="xmas-tree-light"
          style={{ animationDelay: `${l.d}s`, color: l.c }}
        />
      ))}
      <g className="xmas-tree-star">
        <polygon
          points="100,4 107,22 126,22 111,33 117,51 100,40 83,51 89,33 74,22 93,22"
          fill="url(#xt-star)"
        />
      </g>
    </svg>
  );
}

export default function ChristmasDecor({ emojis, showTree = true }) {
  const reduced = useReducedMotion();

  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, () => ({
        top: rand(0, 100),
        left: rand(0, 100),
        size: rand(6, 16),
        dur: rand(1.6, 4),
        delay: rand(0, 4),
      })),
    [],
  );
  const flakes = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        left: rand(0, 100),
        size: rand(3, 8),
        dur: rand(8, 18),
        delay: rand(-18, 0),
        drift: rand(-60, 60),
        o: rand(0.5, 1),
      })),
    [],
  );
  const bulbs = useMemo(() => Array.from({ length: 34 }, (_, i) => i), []);

  return (
    <>
      <div className="xmas-bg" aria-hidden="true">
        <div className="xmas-bg-glow" />
        <div className="xmas-bg-shimmer" />
        <div className="xmas-stars">
          {stars.map((s, i) => (
            <span
              key={i}
              className="xmas-star"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                width: s.size,
                height: s.size,
                animationDuration: `${s.dur}s`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>
        {!reduced && (
          <div className="xmas-snow">
            {flakes.map((f, i) => (
              <span
                key={i}
                className="xmas-flake"
                style={{
                  left: `${f.left}%`,
                  width: f.size,
                  height: f.size,
                  opacity: f.o,
                  animationDuration: `${f.dur}s`,
                  animationDelay: `${f.delay}s`,
                  "--drift": `${f.drift}px`,
                }}
              />
            ))}
          </div>
        )}
        {!reduced && <FloatingXmas emojis={emojis} />}
        {showTree && (
          <div className="xmas-tree-wrap">
            <XmasTree />
            <div className="xmas-gifts">🎁<span>🎁</span></div>
          </div>
        )}
        <div className="xmas-snowdrift" />
      </div>

      <div className="xmas-top" aria-hidden="true">
        <div className="xmas-lights">
          <svg className="xmas-wire" viewBox="0 0 1000 40" preserveAspectRatio="none">
            <path d={WIRE_PATH} />
          </svg>
          {bulbs.map((i) => {
            const x = (i + 0.5) / bulbs.length;
            const local = (x * 10) % 1; // position within one wave of the wire
            const sag = 4 * local * (1 - local) * 12; // matches the quadratic swag
            return (
              <span
                key={i}
                className="xmas-bulb"
                style={{
                  left: `${x * 100}%`,
                  top: `${6 + sag}px`,
                  color: BULB_COLORS[i % BULB_COLORS.length],
                  animationDelay: `${(i % 5) * 0.3}s`,
                }}
              />
            );
          })}
        </div>
        {ORNAMENTS.map((o, i) => (
          <div
            key={i}
            className="xmas-ornament"
            style={{ left: `${o.left}%`, animationDelay: `${o.delay}s` }}
          >
            <span className="xmas-ornament-string" style={{ height: o.len }} />
            <span className="xmas-ornament-cap" />
            <span
              className="xmas-ornament-ball"
              style={{ width: o.size, height: o.size, "--c": o.color }}
            />
          </div>
        ))}
      </div>

      {!reduced && <SparkleTrail />}
    </>
  );
}
