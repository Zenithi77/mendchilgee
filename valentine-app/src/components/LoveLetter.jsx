import { useState, useEffect } from 'react'

export default function LoveLetter({ letter, onClose }) {
  const [phase, setPhase] = useState('envelope') // envelope -> opening -> letter
  const [letterVisible, setLetterVisible] = useState(false)

  useEffect(() => {
    if (phase === 'opening') {
      const t = setTimeout(() => {
        setPhase('letter')
        setTimeout(() => setLetterVisible(true), 200)
      }, 800)
      return () => clearTimeout(t)
    }
  }, [phase])

  if (!letter || !letter.enabled) return null

  return (
    <div className="love-letter-overlay" onClick={() => phase === 'letter' && onClose?.()}>
      <div className="love-letter-container" onClick={e => e.stopPropagation()}>
        {phase === 'envelope' && (
          <div className="ll-envelope" onClick={() => setPhase('opening')}>
            <div className="ll-envelope-body">
              <div className="ll-envelope-flap" />
              <div className="ll-envelope-front">
                <span className="ll-envelope-heart">💌</span>
                <p className="ll-envelope-text">Нээж үзээрэй...</p>
              </div>
            </div>
            <div className="ll-envelope-sparkles">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="ll-sparkle" style={{
                  '--delay': `${i * 0.3}s`,
                  '--x': `${20 + Math.random() * 60}%`,
                  '--y': `${20 + Math.random() * 60}%`,
                }}>✨</span>
              ))}
            </div>
          </div>
        )}

        {phase === 'opening' && (
          <div className="ll-envelope ll-opening">
            <div className="ll-envelope-body">
              <div className="ll-envelope-flap ll-flap-open" />
              <div className="ll-letter-peek" />
            </div>
          </div>
        )}

        {phase === 'letter' && (
          <div className={`ll-letter ${letterVisible ? 'll-letter-visible' : ''}`}>
            <div className="ll-letter-paper">
              <div className="ll-letter-decoration ll-deco-top">💕</div>
              <h2 className="ll-letter-title">{letter.title}</h2>
              <div className="ll-letter-divider">
                <span>♥</span>
              </div>
              <p className="ll-letter-content">{letter.content}</p>
              <div className="ll-letter-signature">
                <span className="ll-heart-trail">
                  {'❤️💕💖💗💓'.split('').map((h, i) => (
                    <span key={i} className="ll-sig-heart" style={{ '--i': i }}>{h}</span>
                  ))}
                </span>
              </div>
              <div className="ll-letter-decoration ll-deco-bottom">🌹</div>
            </div>
            <button className="ll-close-btn" onClick={onClose}>
              Уншлаа 💕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
