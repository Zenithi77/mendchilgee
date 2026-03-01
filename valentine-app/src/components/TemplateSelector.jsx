import { useState } from "react";
import { getTemplatesByCategory, CATEGORIES } from "../templateConfigs";

const CATEGORY_NAMES = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, `${c.emoji} ${c.label}`])
);

export default function TemplateSelector({ onSelect, category }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const templates = category ? getTemplatesByCategory(category) : [];

  const handleSelect = (template) => {
    setSelected(template.id);
    setTimeout(() => onSelect(template), 600);
  };

  return (
    <div className="page page-enter">
      <div className="selector-container">
        {/* Header */}
        <div className="selector-header">
          <div className="selector-icon">🎉</div>
          <h1 className="font-script selector-title">
            {CATEGORY_NAMES[category] || "Мэндчилгээ"}
          </h1>
          <p className="selector-subtitle">Загвараа сонгоорой ✨</p>
        </div>

        {/* Template Cards */}
        <div className="template-grid">
          {templates.map((tmpl, idx) => (
            <div
              key={tmpl.id}
              className={`template-card${hovered === tmpl.id ? " hovered" : ""}${selected === tmpl.id ? " selected" : ""}`}
              style={{
                animationDelay: `${idx * 0.15}s`,
                "--card-primary": tmpl.theme.colors["--t-primary"],
                "--card-secondary": tmpl.theme.colors["--t-secondary"],
                "--card-accent": tmpl.theme.colors["--t-accent"],
                "--card-bg": tmpl.theme.colors["--t-bg2"],
              }}
              onMouseEnter={() => setHovered(tmpl.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleSelect(tmpl)}
            >
              {/* Preview area */}
              <div className="template-preview">
                <div className="template-preview-bg" />
                <div className="template-preview-emoji">
                  {tmpl.card.preview}
                </div>
                {/* Decorative elements */}
                <div className="template-sparkle s1">✦</div>
                <div className="template-sparkle s2">✧</div>
                <div className="template-sparkle s3">✦</div>
              </div>

              {/* Info */}
              <div className="template-info">
                <h3 className="template-name">{tmpl.card.name}</h3>
                <p className="template-desc">{tmpl.card.desc}</p>

                {/* Feature tags */}
                <div className="template-tags">
                  {tmpl.stepQuestions?.steps?.length > 0 && (
                    <span className="template-tag">
                      {tmpl.stepQuestions.steps.length} асуулт
                    </span>
                  )}
                  {tmpl.card.tags.map((tag, ti) => (
                    <span key={ti} className="template-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Select indicator */}
              <div className="template-select-btn">
                {selected === tmpl.id ? "Сонгогдсон ✓" : "Сонгох →"}
              </div>
            </div>
          ))}
        </div>

        <p className="selector-footer">
          Загвараа сонгосны дараа асуулт, зураг нэмэх боломжтой ✨
        </p>
      </div>
    </div>
  );
}
