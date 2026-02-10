import { useState, useEffect, useCallback } from 'react'
import CategorySelector from './components/CategorySelector'
import TemplateSelector from './components/TemplateSelector'
import Welcome2 from './components/Welcome2'
import Question2 from './components/Question2'
import MemoryGallery2 from './components/MemoryGallery2'
import StepQuestions2 from './components/StepQuestions2'
import FinalSummary2 from './components/FinalSummary2'
import LoveLetter from './components/LoveLetter'
import FloatingHearts from './components/FloatingHearts'
import HeartRain from './components/HeartRain'
import './App.css'

// ⬇️ ЭНДЭЭС ӨӨРЧЛӨХ: Хосын эхлэсэн огноо
const RELATIONSHIP_START = new Date('2024-03-15')

/*
  FLOW:
  0. CategorySelector — Категори сонгох (crush, new-couple, long-term, y2k)
  1. TemplateSelector — Загвар сонгох (категориор шүүсэн)
  2. Welcome — Урилга нээх + Love Letter overlay
  3. Question — "Чи намайг хайрладаг юу?"
  4. MemoryGallery — Зураг swipe
  5. StepQuestions — Асуултууд
  6. FinalSummary — Хураангуй + effects
*/

function App() {
  const [category, setCategory] = useState(null) // selected category id
  const [template, setTemplate] = useState(null) // selected template config
  const [page, setPage] = useState(0) // 0 = category selector
  const [choices, setChoices] = useState({})
  const [heartRain, setHeartRain] = useState(false)
  const [showLoveLetter, setShowLoveLetter] = useState(false)

  // Apply theme CSS variables when template changes
  useEffect(() => {
    if (template) {
      const root = document.documentElement
      Object.entries(template.colors).forEach(([key, val]) => {
        root.style.setProperty(key, val)
      })
    }
  }, [template])

  const handleSelectCategory = useCallback((catId) => {
    setCategory(catId)
    setPage(1) // go to template selector
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const handleSelectTemplate = useCallback((tmpl) => {
    setTemplate(tmpl)
    const initChoices = {}
    tmpl.steps.forEach(s => {
      initChoices[s.key] = s.multiSelect ? [] : null
    })
    setChoices(initChoices)
    setPage(2)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const goTo = useCallback((p) => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setPage(p)
    if (p === 4) setHeartRain(true)
  }, [])

  const updateChoice = useCallback((key, val) => {
    setChoices(prev => ({ ...prev, [key]: val }))
  }, [])

  const resetToCategory = useCallback(() => {
    setTemplate(null)
    setCategory(null)
    setPage(0)
    setChoices({})
    setHeartRain(false)
    setShowLoveLetter(false)
    const root = document.documentElement
    ;['--t-primary', '--t-secondary', '--t-accent', '--t-accent2', '--t-soft', '--t-light', '--t-bg', '--t-bg2', '--t-glass', '--t-glass-border'].forEach(k => {
      root.style.removeProperty(k)
    })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const resetToTemplates = useCallback(() => {
    setTemplate(null)
    setPage(1)
    setChoices({})
    setHeartRain(false)
    setShowLoveLetter(false)
    const root = document.documentElement
    ;['--t-primary', '--t-secondary', '--t-accent', '--t-accent2', '--t-soft', '--t-light', '--t-bg', '--t-bg2', '--t-glass', '--t-glass-border'].forEach(k => {
      root.style.removeProperty(k)
    })
    window.scrollTo({ top: 0, behavior: 'instant' })
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

  const themeClass = template ? template.theme : ''
  const hasLoveLetter = template?.loveLetter?.enabled

  // After welcome, show love letter overlay or go to question
  const handleAfterWelcome = useCallback(() => {
    if (hasLoveLetter) {
      setShowLoveLetter(true)
    } else {
      goTo(3)
    }
  }, [hasLoveLetter, goTo])

  const handleCloseLetter = useCallback(() => {
    setShowLoveLetter(false)
    goTo(3)
  }, [goTo])

  return (
    <div className={`app ${themeClass}`}>
      {/* Background effects */}
      <div className="bg-effects">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <FloatingHearts />
      {heartRain && <HeartRain active={heartRain} />}

      {/* Love Letter Overlay */}
      {showLoveLetter && template && (
        <LoveLetter letter={template.loveLetter} onClose={handleCloseLetter} />
      )}

      {/* Back buttons */}
      {page === 1 && (
        <button className="back-to-selector" onClick={resetToCategory}>
          ← Категори солих
        </button>
      )}
      {page > 1 && page < 6 && (
        <button className="back-to-selector" onClick={resetToTemplates}>
          ← Загвар солих
        </button>
      )}

      {/* Pages */}
      {page === 0 && <CategorySelector onSelect={handleSelectCategory} />}
      {page === 1 && <TemplateSelector onSelect={handleSelectTemplate} category={category} />}
      {page === 2 && template && (
        <Welcome2
          startDate={RELATIONSHIP_START}
          onOpen={handleAfterWelcome}
          template={template}
          category={category}
        />
      )}
      {page === 3 && template && (
        <Question2 onYes={() => goTo(4)} template={template} />
      )}
      {page === 4 && template && (
        <MemoryGallery2 memories={template.memories} onContinue={() => goTo(5)} theme={template.theme} />
      )}
      {page === 5 && template && (
        <StepQuestions2
          steps={template.steps}
          choices={choices}
          updateChoice={updateChoice}
          onDone={() => goTo(6)}
          onBack={() => goTo(4)}
          theme={template.theme}
        />
      )}
      {page === 6 && template && (
        <FinalSummary2
          choices={choices}
          quotes={template.quotes}
          theme={template.theme}
          template={template}
          category={category}
        />
      )}
    </div>
  )
}

export default App
