import { useState } from 'react'
import { getTemplatesByCategory } from '../templateConfigs'

const CATEGORY_NAMES = {
  crush: 'Crush / Дурлал 😍',
  'new-couple': 'Шинэ хос 💑',
  'long-term': 'Удаан хос 💍',
  y2k: '2000s Хосууд 📟',
}

export default function TemplateSelector({ onSelect, category }) {
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)

  const templates = category ? getTemplatesByCategory(category) : []

  const handleSelect = (template) => {
    setSelected(template.id)
    setTimeout(() => onSelect(template), 600)
  }

  return (
    <div className="page page-enter">
      <div className="selector-container">
        {/* Header */}
        <div className="selector-header">
          <div className="selector-icon">💌</div>
          <h1 className="font-script selector-title">
            {CATEGORY_NAMES[category] || 'Valentine\'s Day Урилга'}
          </h1>
          <p className="selector-subtitle">
            Загвараа сонгоорой 💕
          </p>
        </div>

        {/* Template Cards */}
        <div className="template-grid">
          {templates.map((tmpl, idx) => (
            <div
              key={tmpl.id}
              className={`template-card${hovered === tmpl.id ? ' hovered' : ''}${selected === tmpl.id ? ' selected' : ''}`}
              style={{
                animationDelay: `${idx * 0.15}s`,
                '--card-primary': tmpl.colors['--t-primary'],
                '--card-secondary': tmpl.colors['--t-secondary'],
                '--card-accent': tmpl.colors['--t-accent'],
                '--card-bg': tmpl.colors['--t-bg2'],
              }}
              onMouseEnter={() => setHovered(tmpl.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleSelect(tmpl)}
            >
              {/* Preview area */}
              <div className="template-preview">
                <div className="template-preview-bg" />
                <div className="template-preview-emoji">{tmpl.preview}</div>
                {/* Decorative elements */}
                <div className="template-sparkle s1">✦</div>
                <div className="template-sparkle s2">✧</div>
                <div className="template-sparkle s3">✦</div>
              </div>

              {/* Info */}
              <div className="template-info">
                <h3 className="template-name">{tmpl.name}</h3>
                <p className="template-desc">{tmpl.desc}</p>

                {/* Feature tags */}
                <div className="template-tags">
                  <span className="template-tag">{tmpl.steps.length} асуулт</span>
                  <span className="template-tag">📸 Зургийн цомог</span>
                  <span className="template-tag">🎉 Хөдөлгөөнт</span>
                </div>
              </div>

              {/* Select indicator */}
              <div className="template-select-btn">
                {selected === tmpl.id ? 'Сонгогдсон ✓' : 'Сонгох →'}
              </div>
            </div>
          ))}
        </div>

        <p className="selector-footer">
          Загвараа сонгосны дараа асуулт, зураг нэмэх боломжтой ✨
        </p>
      </div>
    </div>
  )
}
