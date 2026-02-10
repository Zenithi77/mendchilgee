import { useEffect, useState } from 'react'

const STICKER_SETS = {
  love: ['💕', '💖', '💗', '💓', '💞', '💘', '❤️‍🔥', '🥰', '😘', '💋'],
  cute: ['🧸', '🎀', '🌸', '🦋', '✨', '⭐', '🌟', '💫', '🎪', '🎭'],
  food: ['🍬', '🧁', '🍰', '🍫', '🍭', '🍩', '🎂', '🍪', '🧇', '🍡'],
  retro: ['💿', '📟', '📼', '🎮', '📞', '💾', '🖥️', '📻', '🎧', '📸'],
  nature: ['🌹', '🌺', '🌸', '🌷', '💐', '🌻', '🌼', '🏵️', '🍀', '🌿'],
}

function getRandomSticker(category) {
  const set = STICKER_SETS[category] || STICKER_SETS.love
  return set[Math.floor(Math.random() * set.length)]
}

export default function StickerAnimation({ category = 'love', count = 12, active = true }) {
  const [stickers, setStickers] = useState([])

  useEffect(() => {
    if (!active) return

    const items = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: getRandomSticker(category),
      left: Math.random() * 90 + 5,
      top: Math.random() * 70 + 10,
      size: 24 + Math.random() * 28,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
      rotateStart: -20 + Math.random() * 40,
      floatRange: 15 + Math.random() * 25,
      type: Math.random() > 0.5 ? 'bounce' : 'float',
    }))
    setStickers(items)

    // Refresh stickers periodically
    const interval = setInterval(() => {
      setStickers(prev => prev.map(s => ({
        ...s,
        emoji: getRandomSticker(category),
        left: Math.random() * 90 + 5,
        top: Math.random() * 70 + 10,
      })))
    }, 8000)

    return () => clearInterval(interval)
  }, [active, category, count])

  if (!active) return null

  return (
    <div className="sticker-anim-container">
      {stickers.map(s => (
        <div
          key={s.id}
          className={`sticker-item sticker-${s.type}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: s.size,
            '--s-delay': `${s.delay}s`,
            '--s-dur': `${s.duration}s`,
            '--s-rot': `${s.rotateStart}deg`,
            '--s-float': `${s.floatRange}px`,
          }}
        >
          {s.emoji}
        </div>
      ))}
    </div>
  )
}
