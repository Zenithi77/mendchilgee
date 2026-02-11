import { useEffect, useRef } from "react";

const DEFAULT_EMOJIS = ["❤️", "💖", "💗", "💕", "💘", "💝", "🩷", "🤍", "💜"];

export default function HeartRain({ active, emojis }) {
  const containerRef = useRef(null);
  const launched = useRef(false);

  useEffect(() => {
    if (!active || launched.current) return;
    launched.current = true;

    const emojiArr = emojis || DEFAULT_EMOJIS;
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < 50; i++) {
      const el = document.createElement("span");
      el.className = "rain-heart";
      el.textContent = emojiArr[Math.floor(Math.random() * emojiArr.length)];
      el.style.left = `${Math.random() * 100}%`;
      el.style.fontSize = `${16 + Math.random() * 24}px`;
      el.style.animationDuration = `${2 + Math.random() * 3}s`;
      el.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(el);
      setTimeout(() => el.remove(), 6000);
    }
  }, [active]);

  return <div className="heart-rain" ref={containerRef} />;
}
