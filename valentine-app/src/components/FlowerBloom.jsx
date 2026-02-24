import { useEffect, useState } from "react";

const DEFAULT_FLOWERS = [
  { emoji: "🌸", size: 38, delay: 0 },
  { emoji: "🌺", size: 34, delay: 0.3 },
  { emoji: "🌹", size: 40, delay: 0.6 },
  { emoji: "🌷", size: 36, delay: 0.15 },
  { emoji: "💐", size: 42, delay: 0.45 },
  { emoji: "🌻", size: 35, delay: 0.75 },
  { emoji: "🌼", size: 32, delay: 0.9 },
  { emoji: "🏵️", size: 37, delay: 0.2 },
  { emoji: "🌸", size: 30, delay: 1.0 },
  { emoji: "🌺", size: 36, delay: 0.5 },
  { emoji: "🌹", size: 33, delay: 0.35 },
  { emoji: "🌷", size: 38, delay: 0.8 },
  { emoji: "💮", size: 28, delay: 1.1 },
  { emoji: "🌸", size: 34, delay: 0.65 },
];

export default function FlowerBloom({
  active = true,
  flowers: flowersProp,
  leafEmoji,
}) {
  const [flowers, setFlowers] = useState([]);
  const [phase, setPhase] = useState("growing");
  const leafChar = leafEmoji || "🍃";
  const flowerData = flowersProp || DEFAULT_FLOWERS;

  useEffect(() => {
    if (!active) return;
    const spread = flowerData.map((f, i) => ({
      ...f,
      delay: f.delay || i * 0.08,
      id: i,
      left: 3 + (i / flowerData.length) * 94 + (Math.random() - 0.5) * 8,
      stemHeight: 80 + Math.random() * 160,
      swayDuration: 2 + Math.random() * 2,
      swayDelay: Math.random() * 2,
    }));
    setFlowers(spread);

    const fullTimer = setTimeout(() => setPhase("full"), 2500);
    const fadeTimer = setTimeout(() => setPhase("fading"), 7000);

    return () => {
      clearTimeout(fullTimer);
      clearTimeout(fadeTimer);
    };
  }, [active]);

  if (!active || flowers.length === 0) return null;

  return (
    <div className={`flower-bloom-container flower-bloom-${phase}`}>
      {flowers.map((f) => (
        <div
          key={f.id}
          className="flower-stem-group"
          style={{
            "--left": `${f.left}%`,
            "--stem-h": `${f.stemHeight}px`,
            "--delay": `${f.delay}s`,
            "--sway-dur": `${f.swayDuration}s`,
            "--sway-delay": `${f.swayDelay}s`,
          }}
        >
          <div className="flower-stem" />
          <div className="flower-head" style={{ fontSize: f.size }}>
            {f.emoji}
          </div>
          {/* Leaves */}
          <div className="flower-leaf flower-leaf-left">{leafChar}</div>
          <div className="flower-leaf flower-leaf-right">{leafChar}</div>
        </div>
      ))}
      {/* hello */}
      {/* Petals floating */}
      {phase === "full" &&
        [...Array(8)].map((_, i) => (
          <div
            key={`petal-${i}`}
            className="flower-petal-float"
            style={{
              "--px": `${10 + Math.random() * 80}%`,
              "--pd": `${Math.random() * 3}s`,
              "--ps": `${3 + Math.random() * 4}s`,
            }}
          >
            🌸
          </div>
        ))}
    </div>
  );
}
