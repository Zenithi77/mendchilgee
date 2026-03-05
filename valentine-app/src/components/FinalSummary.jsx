import { useEffect, useState } from 'react'
import Confetti from './Confetti'

const SUMMARY_FIELDS = [
  { key: 'place', emoji: '📍', label: 'Уулзах газар' },
  { key: 'activity', emoji: '🎯', label: 'Хийх зүйл' },
  { key: 'time', emoji: '⏰', label: 'Цаг' },
  { key: 'outfit', emoji: '👗', label: 'Хувцасны хэв маяг' },
  { key: 'gift', emoji: '🎁', label: 'Бэлэг' },
]

const LOVE_QUOTES = [
  'Чамтай хамт байх мөч бүр онцгой ✨',
  'Хайр гэдэг чамтай хамт амьдрах мөрөөдөл 🌙',
  'Чи бол миний бүх зүйл 💝',
  'Энэ мэндчилгээ зүрхнээс ирэв ❤️',
]

export default function FinalSummary({ choices, onContinue }) {
  const [meterW, setMeterW] = useState(0)
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [revealedRows, setRevealedRows] = useState(0)

  useEffect(() => {
    // Animate meter aa
    const t1 = setTimeout(() => setMeterW(100), 600)

    // Reveal summary rows one by one 1


    const timers = SUMMARY_FIELDS.map((_, i) =>
      setTimeout(() => setRevealedRows(i + 1), 400 + i * 300)
    )

    // Rotate quotes
    const iv = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % LOVE_QUOTES.length)
    }, 4000)

    return () => {
      clearTimeout(t1)
      timers.forEach(clearTimeout)
      clearInterval(iv)
    }
  }, [])

  return (
    <div className="page page-enter">
      <Confetti active={true} />

      <div className="glass final-card">
        <div className="final-heart">💝</div>

        <h2 className="font-script" style={{ fontSize: '2.3rem', color: 'var(--pink)', marginBottom: 6 }}>
          Бүх зүйл бэлэн! 🎉
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
          Мэндчилгээ • mendchilgee.site
        </p>

        {/* Summary */}
        <div className="summary-box">
          {SUMMARY_FIELDS.map((f, i) => (
            <div
              key={f.key}
              className="summary-row"
              style={{
                opacity: i < revealedRows ? 1 : 0,
                transform: i < revealedRows ? 'translateX(0)' : 'translateX(-20px)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span className="sr-icon">{f.emoji}</span>
              <div>
                <div className="sr-label">{f.label}</div>
                <div className="sr-val">{choices[f.key] || '—'}</div>
              </div>
            </div>
          ))}
          <div
            className="summary-row"
            style={{
              opacity: revealedRows >= SUMMARY_FIELDS.length ? 1 : 0,
              transform: revealedRows >= SUMMARY_FIELDS.length ? 'translateX(0)' : 'translateX(-20px)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            }}
          >
            <span className="sr-icon">📅</span>
            <div>
              <div className="sr-label">Огноо</div>
              <div className="sr-val">2026.02.14 ❤️</div>
            </div>
          </div>
        </div>

        {/* Love Meter */}
        <div className="meter">
          <div className="meter-label">Сэрэлийн түвшин</div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${meterW}%` }} />
          </div>
          <div className="meter-text">♾️ Хязгааргүй</div>
        </div>

        {/* Rotating quote */}
        <p className="final-msg" style={{ minHeight: 80 }}>
          {LOVE_QUOTES[quoteIdx]}
        </p>

        {/* Signature */}
        <div className="font-vibes" style={{ fontSize: '1.6rem', color: 'var(--rose)', marginBottom: 8 }}>
          Зүрхнээсээ
        </div>

        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginTop: 20 }}>
          mendchilgee.site • Made with ❤️
        </div>

        {/* Finish button */}
        {onContinue && (
          <button
            onClick={onContinue}
            style={{
              marginTop: 24,
              padding: '14px 36px',
              borderRadius: 60,
              border: 'none',
              background: 'linear-gradient(135deg, var(--pink, #ff85a2), var(--rose, #ff6b9d))',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(255,107,157,0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            Дуусгах ✨
          </button>
        )}
      </div>
    </div>
  )
}
