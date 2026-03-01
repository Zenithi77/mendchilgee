import { useState, useEffect } from 'react'

export default function Welcome({ startDate, onOpen }) {
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

  return (
    <div className="page page-enter">
      <div className="glass" style={{ padding: '48px 38px', textAlign: 'center', maxWidth: 480, width: '100%' }}>

        {/* Envelope */}
        <div className="envelope-wrap">
          <div className="envelope">
            <div className="env-letter">💌</div>
            <div className="env-body" />
            <div className="env-flap" />
            <div className="env-heart">💝</div>
          </div>
        </div>

        <h1 className="font-script" style={{ fontSize: '2.4rem', color: 'var(--pink)', marginBottom: 8, textShadow: '0 0 40px rgba(255,107,157,0.3)' }}>
          Мэндчилгээ 🎉
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.6)', marginBottom: 28, lineHeight: 1.7 }}>
          Танд зориулсан тусгай<br />мэндчилгээний хуудас ✨
        </p>

        {/* Timer */}
        <div style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.12), rgba(255,154,158,0.12))', border: '1px solid rgba(255,107,157,0.25)', borderRadius: 18, padding: '16px 20px', marginBottom: 28 }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            Цаг хугацаа
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
          Мэндчилгээ нээх 🎁
        </button>
      </div>
    </div>
  )
}
