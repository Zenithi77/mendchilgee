import { useState } from "react";
import { CATEGORIES } from "../templateConfigs";
import { MdAutoAwesome, MdCheck, MdArrowForward, MdAccessTime } from "react-icons/md";

// Available holiday categories
const AVAILABLE_CATEGORIES = new Set(["march8", "soldiers-day"]);

export default function CategorySelector({ onSelect, onOpenBuilder }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const handleSelect = (cat) => {
    if (!AVAILABLE_CATEGORIES.has(cat.id)) return;
    setSelected(cat.id);
    setTimeout(() => onSelect(cat.id), 700);
  };

  return (
    <div className="page page-enter">
      <div className="category-container">
        {/* Header */}
        <div className="cat-header">
          <h1 className="font-script cat-header-title">Мэндчилгээ</h1>
          <p className="cat-header-sub">Баярын төрлөө сонгоорой <MdAutoAwesome /></p>
        </div>

        {/* Category Cards */}
        <div className="cat-grid">
          {CATEGORIES.map((cat, idx) => {
            const isAvailable = AVAILABLE_CATEGORIES.has(cat.id);
            return (
              <div
                key={cat.id}
                className={`cat-card${hovered === cat.id ? " hovered" : ""}${selected === cat.id ? " selected" : ""}${!isAvailable ? " cat-card-coming-soon" : ""}`}
                style={{ animationDelay: `${idx * 0.12}s` }}
                onMouseEnter={() => setHovered(cat.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleSelect(cat)}
              >
                {/* Coming Soon badge */}
                {!isAvailable && (
                  <div className="cat-coming-soon-badge">
                    <MdAccessTime /> Тун удахгүй
                  </div>
                )}

                {/* Gradient strip */}
                <div
                  className="cat-card-strip"
                  style={{ background: isAvailable ? cat.gradient : "linear-gradient(135deg, #94a3b8, #64748b)" }}
                />

                <div className="cat-card-body">
                  <div className="cat-card-emoji">{cat.emoji}</div>
                  <h3 className="cat-card-name">{cat.name}</h3>
                  <p className="cat-card-desc">{cat.desc}</p>
                  <div className="cat-card-vibe">
                    <span
                      className="cat-vibe-dot"
                      style={{ background: isAvailable ? cat.gradient : "linear-gradient(135deg, #94a3b8, #64748b)" }}
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
                  style={{ background: isAvailable ? cat.gradient : "linear-gradient(135deg, #94a3b8, #64748b)" }}
                >
                  {!isAvailable ? (
                    <><MdAccessTime /> Coming Soon</>
                  ) : selected === cat.id ? (
                    <><MdCheck /> Сонгогдсон</>
                  ) : (
                    <>Сонгох <MdArrowForward /></>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
