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
  const triggerRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Calculate fixed position when opening
  const handleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 280; // approximate
        const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
        setDropdownStyle({
          position: "fixed",
          left: Math.min(rect.left, window.innerWidth - 290),
          top: openUp ? rect.top - dropdownHeight : rect.bottom + 4,
          zIndex: 9999,
        });
      }
      return next;
    });
  };

  return (
    <div className="emoji-picker-wrapper" ref={pickerRef}>
      <button
        type="button"
        className="emoji-picker-trigger"
        ref={triggerRef}
        onClick={handleOpen}
        title="Emoji нэмэх"
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="emoji-picker-dropdown" style={dropdownStyle}>
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
