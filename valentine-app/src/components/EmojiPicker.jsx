import { useState, useRef, useEffect } from "react";
import "./EmojiPicker.css";

const EMOJI_CATEGORIES = {
  "❤️ Зүрх": [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💗",
    "💖",
    "💝",
    "💘",
    "💕",
    "💓",
    "💞",
    "🩷",
    "🩵",
    "🩶",
    "♥️",
    "💟",
    "❣️",
  ],
  "😊 Царай": [
    "😍",
    "🥰",
    "😘",
    "😻",
    "🤗",
    "😊",
    "🥺",
    "😢",
    "😭",
    "😤",
    "🤔",
    "😎",
    "🤡",
    "🙂",
    "😇",
    "🤩",
    "😉",
    "💀",
    "👀",
    "🫶",
  ],
  "🌸 Байгаль": [
    "🌸",
    "🌺",
    "🌹",
    "🌷",
    "💐",
    "🌻",
    "🌼",
    "🍀",
    "🌿",
    "🍃",
    "🍂",
    "🍁",
    "☀️",
    "🌙",
    "⭐",
    "✨",
    "🌈",
    "❄️",
    "🔥",
    "💧",
  ],
  "🎉 Баяр": [
    "🎉",
    "🎊",
    "🎈",
    "🎁",
    "🎀",
    "🎂",
    "🥳",
    "🎵",
    "🎶",
    "🎤",
    "🎬",
    "🏆",
    "🥇",
    "👑",
    "💎",
    "💍",
    "🧸",
    "🪄",
    "🎯",
    "🎪",
  ],
  "🍕 Хоол": [
    "☕",
    "🍫",
    "🍰",
    "🎂",
    "🍕",
    "🍔",
    "🍟",
    "🍿",
    "🍩",
    "🍪",
    "🍦",
    "🧁",
    "🥂",
    "🍷",
    "🍹",
    "🧃",
    "🍓",
    "🍒",
    "🍑",
    "🫐",
  ],
  "📍 Газар": [
    "📍",
    "🏠",
    "🏡",
    "🏢",
    "🏝️",
    "⛰️",
    "🗼",
    "🎡",
    "🎢",
    "🎠",
    "🛝",
    "🏕️",
    "🚗",
    "✈️",
    "🚀",
    "🛳️",
    "🗽",
    "🌆",
    "🌃",
    "🌉",
  ],
  "👋 Хүн": [
    "👋",
    "✌️",
    "🤞",
    "👍",
    "👎",
    "👏",
    "🙌",
    "🫶",
    "💪",
    "🤝",
    "🙏",
    "💅",
    "🤟",
    "✊",
    "👊",
    "🫰",
    "🤌",
    "☝️",
    "👆",
    "👇",
  ],
  "⏰ Бусад": [
    "⏰",
    "📅",
    "📸",
    "📝",
    "🔔",
    "💌",
    "📬",
    "🎯",
    "🔮",
    "💫",
    "🪩",
    "🎭",
    "🎪",
    "🧩",
    "♾️",
    "⚡",
    "🫧",
    "🔒",
    "🗝️",
    "🏷️",
  ],
};

export default function EmojiPicker({ onSelect, triggerLabel = "😊" }) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    Object.keys(EMOJI_CATEGORIES)[0],
  );
  const pickerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="emoji-picker-wrapper" ref={pickerRef}>
      <button
        type="button"
        className="emoji-picker-trigger"
        onClick={() => setOpen((p) => !p)}
        title="Emoji нэмэх"
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="emoji-picker-dropdown">
          {/* Category tabs */}
          <div className="emoji-picker-tabs">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`emoji-picker-tab ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.split(" ")[0]}
              </button>
            ))}
          </div>
          {/* Emoji grid */}
          <div className="emoji-picker-grid">
            {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="emoji-picker-item"
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
