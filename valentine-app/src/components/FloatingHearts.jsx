import { useState, useEffect, useRef } from "react";

const DEFAULT_HEARTS = [
  "❤️",
  "💕",
  "💖",
  "💗",
  "💝",
  "🥰",
  "✨",
  "💘",
  "💓",
  "💞",
];

export default function FloatingHearts({ emojis }) {
  const heartsArr = emojis || DEFAULT_HEARTS;
  const [items, setItems] = useState([]);
  const id = useRef(0);

  useEffect(() => {
    const iv = setInterval(() => {
      const i = id.current++;
      setItems((prev) => [
        ...prev,
        {
          id: i,
          emoji: heartsArr[Math.floor(Math.random() * heartsArr.length)],
          left: Math.random() * 100,
          size: 14 + Math.random() * 22,
          dur: 10 + Math.random() * 15,
          delay: Math.random() * 3,
        },
      ]);
      setTimeout(
        () => setItems((prev) => prev.filter((h) => h.id !== i)),
        28000,
      );
    }, 600);
    return () => clearInterval(iv);
  }, [heartsArr]);

  return (
    <div className="hearts-canvas">
      {items.map((h) => (
        <span
          key={h.id}
          className="float-heart"
          style={{
            left: `${h.left}%`,
            fontSize: h.size,
            animationDuration: `${h.dur}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}
