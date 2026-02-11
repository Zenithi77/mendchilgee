import { useEffect, useRef } from "react";

const DEFAULT_COLORS = [
  "#ff6b9d",
  "#ff4081",
  "#c471ed",
  "#7c4dff",
  "#ff9a9e",
  "#ffd1dc",
  "#fff",
  "#f8bbd0",
];

export default function Confetti({ active, colors }) {
  const launched = useRef(false);

  useEffect(() => {
    if (!active || launched.current) return;
    launched.current = true;

    const colorArr = colors || DEFAULT_COLORS;
    const body = document.body;

    for (let i = 0; i < 80; i++) {
      const el = document.createElement("div");
      el.className = "confetti";
      const size = 6 + Math.random() * 12;
      el.style.left = `${Math.random() * 100}%`;
      el.style.width = `${size}px`;
      el.style.height = `${size * (0.4 + Math.random() * 0.6)}px`;
      el.style.background =
        colorArr[Math.floor(Math.random() * colorArr.length)];
      el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      el.style.animationDuration = `${2.5 + Math.random() * 3}s`;
      el.style.animationDelay = `${Math.random() * 2}s`;
      body.appendChild(el);
      setTimeout(() => el.remove(), 7000);
    }
  }, [active]);

  return null;
}
