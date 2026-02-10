import { useState } from 'react'

const CATEGORIES = [
  {
    id: 'crush',
    emoji: '😍',
    name: 'Crush / Дурлал',
    desc: 'Хараахан үерхээгүй, дурлаж байгаа хүндээ',
    vibe: 'Ичимхий, зоригтой, сэтгэл dogdog',
    gradient: 'linear-gradient(135deg, #ff6b9d, #ff4081)',
    bgEmojis: ['💘', '😍', '🦋', '💌'],
  },
  {
    id: 'new-couple',
    emoji: '💑',
    name: 'Шинэ хос',
    desc: 'Саяхан үерхэж эхэлсэн хосууд',
    vibe: 'Шинэлэг, сэтгэл хөдлөм, хөөрхөн',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    bgEmojis: ['💕', '🥰', '💗', '✨'],
  },
  {
    id: 'long-term',
    emoji: '💍',
    name: 'Удаан хос',
    desc: 'Удаан хугацаанд хамт байгаа хосууд',
    vibe: 'Гүнзгий хайр, итгэлцэл, хамтын дурсамж',
    gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    bgEmojis: ['💝', '🫶', '💞', '🥂'],
  },
  {
    id: 'y2k',
    emoji: '📟',
    name: '2000s Хосууд',
    desc: '2000 оны стилиар Valentine тэмдэглэе',
    vibe: 'Retro, ностальги, дээр үеийн уур амьсгал',
    gradient: 'linear-gradient(135deg, #00d2ff, #ff00e5)',
    bgEmojis: ['📟', '💿', '🦋', '⭐'],
  },
]

export default function CategorySelector({ onSelect }) {
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)

  const handleSelect = (cat) => {
    setSelected(cat.id)
    setTimeout(() => onSelect(cat.id), 700)
  }

  return (
    <div className="page page-enter">
      <div className="category-container">
        {/* Header */}
        <div className="cat-header">
          <div className="cat-header-emoji">💕</div>
          <h1 className="font-script cat-header-title">
            Valentine's Day 2026
          </h1>
          <p className="cat-header-sub">
            Хайрын шатаа сонгоорой 💫
          </p>
        </div>

        {/* Category Cards */}
        <div className="cat-grid">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              className={`cat-card${hovered === cat.id ? ' hovered' : ''}${selected === cat.id ? ' selected' : ''}`}
              style={{ animationDelay: `${idx * 0.12}s` }}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleSelect(cat)}
            >
              {/* Gradient strip */}
              <div className="cat-card-strip" style={{ background: cat.gradient }} />

              <div className="cat-card-body">
                <div className="cat-card-emoji">{cat.emoji}</div>
                <h3 className="cat-card-name">{cat.name}</h3>
                <p className="cat-card-desc">{cat.desc}</p>
                <div className="cat-card-vibe">
                  <span className="cat-vibe-dot" style={{ background: cat.gradient }} />
                  {cat.vibe}
                </div>

                {/* Floating bg emojis */}
                <div className="cat-card-bg-emojis">
                  {cat.bgEmojis.map((e, i) => (
                    <span key={i} className={`cat-bg-emoji e${i}`}>{e}</span>
                  ))}
                </div>
              </div>

              <div className="cat-card-action" style={{ background: cat.gradient }}>
                {selected === cat.id ? '✓ Сонгогдсон' : 'Сонгох →'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
