import { useState, useEffect, useCallback } from 'react'
import Welcome from './components/Welcome'
import Question from './components/Question'
import MemoryGallery from './components/MemoryGallery'
import StepQuestions from './components/StepQuestions'
import FinalSummary from './components/FinalSummary'
import FloatingHearts from './components/FloatingHearts'
import HeartRain from './components/HeartRain'
import './App.css'

// ⬇️ ЭНДЭЭС ӨӨРЧЛӨХ: Хосын эхлэсэн огноо
const RELATIONSHIP_START = new Date('2024-03-15')

/*
  FLOW:
  1. Welcome — Урилга нээх
  2. Question — "Чи намайг хайрладаг юу?"
  3. MemoryGallery — Зураг, видео, дурсамжууд (scroll)
  4. StepQuestions — Асуултууд хэсэг хэсгээр (5 алхам)
  5. FinalSummary — Хураангуй + confetti
*/

function App() {
  const [page, setPage] = useState(1)
  const [choices, setChoices] = useState({
    place: null, activity: null, time: null, outfit: null, gift: null,
  })
  const [heartRain, setHeartRain] = useState(false)

  const goTo = useCallback((p) => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setPage(p)
    if (p === 3) setHeartRain(true)
  }, [])

  const updateChoice = useCallback((key, val) => {
    setChoices(prev => ({ ...prev, [key]: val }))
  }, [])

  // Click sparkle effect
  useEffect(() => {
    const emojis = ['✨', '💖', '💕', '⭐']
    const handle = (e) => {
      const el = document.createElement('span')
      el.className = 'click-sparkle'
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)]
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 800)
    }
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [])

  return (
    <div className="app">
      {/* Background effects */}
      <div className="bg-effects">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <FloatingHearts />
      <HeartRain active={heartRain} />

      {page === 1 && <Welcome startDate={RELATIONSHIP_START} onOpen={() => goTo(2)} />}
      {page === 2 && <Question onYes={() => goTo(3)} />}
      {page === 3 && <MemoryGallery onContinue={() => goTo(4)} />}
      {page === 4 && <StepQuestions choices={choices} updateChoice={updateChoice} onDone={() => goTo(5)} />}
      {page === 5 && <FinalSummary choices={choices} />}
    </div>
  )
}

export default App
