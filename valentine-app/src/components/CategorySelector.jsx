import { useState } from "react";
import { CATEGORIES } from "../templateConfigs";

export default function CategorySelector({ onSelect, onOpenBuilder }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const handleSelect = (cat) => {
    setSelected(cat.id);
    setTimeout(() => onSelect(cat.id), 700);
  };

  return (
    <div className="page page-enter">
      <div className="category-container">
        {/* Header */}
        <div className="cat-header">
          <div className="cat-header-emoji">🎉</div>
          <h1 className="font-script cat-header-title">Мэндчилгээ</h1>
          <p className="cat-header-sub">Баярын төрлөө сонгоорой 💫</p>
        </div>

        {/* Builder entry point */}
        {onOpenBuilder && (
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <button
              className="btn btn-love"
              onClick={onOpenBuilder}
              style={{ fontSize: "0.95rem" }}
            >
              ✨ Өөрөө бүтээх — Мэндчилгээ Builder
            </button>
          </div>
        )}

        {/* Category Cards */}
        <div className="cat-grid">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              className={`cat-card${hovered === cat.id ? " hovered" : ""}${selected === cat.id ? " selected" : ""}`}
              style={{ animationDelay: `${idx * 0.12}s` }}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleSelect(cat)}
            >
              {/* Gradient strip */}
              <div
                className="cat-card-strip"
                style={{ background: cat.gradient }}
              />

              <div className="cat-card-body">
                <div className="cat-card-emoji">{cat.emoji}</div>
                <h3 className="cat-card-name">{cat.name}</h3>
                <p className="cat-card-desc">{cat.desc}</p>
                <div className="cat-card-vibe">
                  <span
                    className="cat-vibe-dot"
                    style={{ background: cat.gradient }}
                  />
                  {cat.vibe}
                </div>

                {/* Floating bg emojis */}
                <div className="cat-card-bg-emojis">
                  {cat.bgEmojis.map((e, i) => (
                    <span key={i} className={`cat-bg-emoji e${i}`}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="cat-card-action"
                style={{ background: cat.gradient }}
              >
                {selected === cat.id ? "✓ Сонгогдсон" : "Сонгох →"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
