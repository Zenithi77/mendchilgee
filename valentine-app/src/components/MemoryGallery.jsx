import { useEffect, useRef, useState } from 'react'


const MEMORIES = [
  {
    type: 'image',
    src: '',
    placeholder: '📸',
    date: 'Эхний уулзалт',
    caption: 'Анх уулзсан тэр мөч... ✨',
  },
  {
    type: 'image',
    src: '',
    placeholder: '🎂',
    date: 'Төрсөн өдөр',
    caption: 'Чамтай хамт тэмдэглэсэн анхны төрсөн өдөр гоё шиөнө байсандаа 😊🎉',
  },
  {
    type: 'video',
    src: '',
    placeholder: '🎥',
    date: 'Дурсамж',
    caption: 'Хамтдаа хийж байсан тэр мөч 😊',
  },
  {
    type: 'image',
    src: '',
    placeholder: '🌅',
    date: 'Аялал',
    caption: 'Нар жаргахыг ххамтдаа харж хийцгээе 🌇',
  },
  {
    type: 'image',
    src: '',
    placeholder: '💕',
    date: 'Онцгой мөч',
    caption: 'Чамтай байх мөч бүр онцгой хүнгорхон минь 💖',
  },
  {
    type: 'video',
    src: '',
    placeholder: '🎬',
    date: 'Бидний видео',
    caption: 'Бид хоёрын мартагдашгүй мөч бид анх хүүхэд хийж байсан мөч🥰',
  },
]

export default function MemoryGallery({ onContinue }) {
  const [visibleCards, setVisibleCards] = useState(new Set())
  const cardRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.idx)
            setVisibleCards(prev => new Set([...prev, idx]))
          }
        })
      },
      { threshold: 0.2 }
    )

    cardRefs.current.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ paddingTop: 60, paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 50, padding: '0 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'bearLove 1.5s ease infinite' }}>💝</div>
        <h2 className="font-script" style={{ fontSize: '2.2rem', color: 'var(--pink)', marginBottom: 10 }}>
          Бидний дурсамжууд
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          Хамтдаа туулсан онцгой мөчүүд 🌟<br />
          <span style={{ fontSize: '0.75rem' }}>Доош scroll хийж үзнэ үү</span>
        </p>
      </div>

      {/* Cards */}
      <div className="gallery-section" style={{ margin: '0 auto' }}>
        <div className="memory-grid">
          {MEMORIES.map((mem, i) => (
            <div
              key={i}
              ref={el => cardRefs.current[i] = el}
              data-idx={i}
              className={`memory-card${visibleCards.has(i) ? ' visible' : ''}`}
              style={{ transitionDelay: `${0.1 * (i % 3)}s` }}
            >
              <div className="memory-img-wrap">
                {mem.src ? (
                  mem.type === 'video' ? (
                    <video src={mem.src} controls playsInline loop muted />
                  ) : (
                    <img src={mem.src} alt={mem.caption} loading="lazy" />
                  )
                ) : (
                  <div className="memory-placeholder">
                    <div className="icon">{mem.placeholder}</div>
                    <div className="hint">Хүссэн зургаа энд нэмнэ үү</div>
                  </div>
                )}
              </div>
              <div className="memory-caption">
                <div className="date">{mem.date}</div>
                <div className="text">{mem.caption}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="gallery-continue">
          <p className="font-script" style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
            Бүх дурсамж үнэ цэнэтэй... 💕<br />
            Одоо Valentine's Day-г төлөвлөе!
          </p>
          <button className="btn btn-magic" onClick={onContinue}>
            Болзоо төлөвлөх 👩‍❤️‍👨
          </button>
        </div>
      </div>
    </div>
  )
}
