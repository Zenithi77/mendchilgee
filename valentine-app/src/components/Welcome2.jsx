import { useState, useEffect } from 'react'

export default function Welcome2({ startDate, onOpen, template }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = Date.now() - startDate.getTime()
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [startDate])

  const charType = template?.character || 'bear'

  return (
    <div className="page page-enter">
      <div className="glass" style={{ padding: '48px 38px', textAlign: 'center', maxWidth: 480, width: '100%' }}>

        {/* Character / Envelope based on template */}
        {charType === 'bear' && (
          <div className="envelope-wrap">
            <div className="envelope">
              <div className="env-letter">💌</div>
              <div className="env-body" />
              <div className="env-flap" />
              <div className="env-heart">💝</div>
            </div>
          </div>
        )}

        {charType === 'moon' && (
          <div className="welcome-char moon-char">
            <div className="moon-body">🌙</div>
            <div className="moon-stars">
              <span className="moon-star s1">⭐</span>
              <span className="moon-star s2">✨</span>
              <span className="moon-star s3">⭐</span>
              <span className="moon-star s4">✨</span>
              <span className="moon-star s5">💫</span>
            </div>
          </div>
        )}

        {charType === 'cat' && (
          <div className="welcome-char cat-char">
            <div className="cat-body">🐱</div>
            <div className="cat-hearts">
              <span className="cat-heart h1">💕</span>
              <span className="cat-heart h2">🍬</span>
              <span className="cat-heart h3">🧁</span>
            </div>
          </div>
        )}

        {charType === 'butterfly' && (
          <div className="welcome-char butterfly-char">
            <div className="butterfly-body">🦋</div>
            <div className="butterfly-sparkles">
              <span className="bf-sparkle s1">💕</span>
              <span className="bf-sparkle s2">✨</span>
              <span className="bf-sparkle s3">🌸</span>
              <span className="bf-sparkle s4">💖</span>
            </div>
          </div>
        )}

        {charType === 'fire' && (
          <div className="welcome-char fire-char">
            <div className="fire-body">🔥</div>
            <div className="fire-sparks">
              <span className="fire-spark s1">❤️‍🔥</span>
              <span className="fire-spark s2">⚡</span>
              <span className="fire-spark s3">💥</span>
            </div>
          </div>
        )}

        {charType === 'retro' && (
          <div className="welcome-char retro-char">
            <div className="retro-body">📟</div>
            <div className="retro-icons">
              <span className="retro-icon s1">💿</span>
              <span className="retro-icon s2">🦋</span>
              <span className="retro-icon s3">📼</span>
              <span className="retro-icon s4">💾</span>
            </div>
          </div>
        )}

        <h1 className="font-script" style={{
          fontSize: '2.4rem',
          color: 'var(--t-primary, var(--pink))',
          marginBottom: 8,
          textShadow: '0 0 40px rgba(255,107,157,0.3)'
        }}>
          {template?.welcomeTitle || 'Happy Valentine\'s Day 💕'}
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.6)', marginBottom: 28, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {template?.welcomeSubtitle || 'Хамгийн хайртай хүндээ зориулсан\nтусгай урилга ❤️'}
        </p>

        {/* Timer */}
        <div className="welcome-timer-box">
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            Бид хамт байсан хугацаа
          </div>
          <div className="timer-grid">
            {[
              [time.d, 'Өдөр'], [time.h, 'Цаг'], [time.m, 'Минут'], [time.s, 'Секунд']
            ].map(([val, label]) => (
              <div className="timer-box" key={label}>
                <div className="timer-num">{val}</div>
                <div className="timer-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-love" onClick={onOpen}>
          Урилга нээх 💌
        </button>
      </div>
    </div>
  )
}
