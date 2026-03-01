import { useState } from 'react'

const STEPS = [
  {
    emoji: '📍',
    title: 'Хаана хийх вэ?',
    key: 'place',
    type: 'grid',
    options: [
      { emoji: '🍽️', name: 'Ресторан', desc: 'Романтик оройн хоол', value: 'Ресторан' },
      { emoji: '☕', name: 'Кафе', desc: 'Дулаахан уур амьсгал', value: 'Кафе' },
      { emoji: '🎬', name: 'Кино театр', desc: 'Хамтдаа кино үзье', value: 'Кино театр' },
      { emoji: '🏠', name: 'Гэрээр', desc: 'Хамтдаа хоол хийе', value: 'Гэрээр' },
      { emoji: '🌃', name: 'Шөнийн хот', desc: 'Хотоор зугаалъя', value: 'Шөнийн хот' },
      { emoji: '🏔️', name: 'Байгаль', desc: 'Байгалийн үзэсгэлэн', value: 'Байгаль' },
    ],
  },
  {
    emoji: '🎯',
    title: 'Яаж хийх вэ?',
    key: 'activity',
    type: 'grid',
    options: [
      { emoji: '🍕', name: 'Хоол идэх', value: 'Хоол идэнгээ' },
      { emoji: '🚶‍♂️', name: 'Алхах', value: 'Алхангаа' },
      { emoji: '🎥', name: 'Кино үзэх', value: 'Кино үзэнгээ' },
      { emoji: '🎮', name: 'Тоглоом', value: 'Тоглонгоо' },
      { emoji: '💃', name: 'Бүжиглэх', value: 'Бүжиглэнгээ' },
      { emoji: '🎤', name: 'Караоке', value: 'Караоке хийж' },
    ],
  },
  {
    emoji: '⏰',
    title: 'Хэдэн цаг хийх вэ?',
    key: 'time',
    type: 'time',
    options: [
      { label: '🌤️ 12:00', value: '12:00' },
      { label: '☀️ 14:00', value: '14:00' },
      { label: '🌅 17:00', value: '17:00' },
      { label: '🌙 19:00', value: '19:00' },
      { label: '✨ 20:00', value: '20:00' },
      { label: '🌃 21:00', value: '21:00' },
    ],
  },
  {
    emoji: '👗',
    title: 'Хувцасны хэв маяг',
    key: 'outfit',
    type: 'grid',
    options: [
      { emoji: '👔', name: 'Гоёмсог', value: 'Гоёмсог' },
      { emoji: '👕', name: 'Энгийн тохилог', value: 'Энгийн тохилог' },
      { emoji: '👫', name: 'Хос хувцас', value: 'Хос хувцас' },
      { emoji: '🎁', name: 'Сюрприз!', value: 'Сюрприз , туулай' },
    ],
  },
  {
    emoji: '🎁',
    title: 'Бэлэг юу авах вэ?',
    key: 'gift',
    type: 'grid',
    options: [
      { emoji: '🌹', name: 'Цэцэг', value: 'Цэцэг' },
      { emoji: '🍫', name: 'Шоколад', value: 'Шоколад' },
      { emoji: '💍', name: 'Зүүлт', value: 'Зүүлт' },
      { emoji: '🧸', name: 'Тоглоом баавгай', value: 'Тоглоом баавгай' },
      { emoji: '💌', name: 'Захидал', value: 'Захидал' },
      { emoji: '🎁', name: 'Сюрприз', value: 'Сюрприз бэлэг' },
    ],
  },
]

export default function StepQuestions({ choices, updateChoice, onDone }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const totalSteps = STEPS.length

  const handleSelect = (value) => {
    updateChoice(current.key, value)
  }

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      onDone()
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const isSelected = choices[current.key] != null

  return (
    <div className="page page-enter" key={step}>
      <div className="glass step-card">
        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`step-dot${i === step ? ' active' : i < step ? ' done' : ''}`}
            />
          ))}
        </div>

        <div className="step-emoji">{current.emoji}</div>
        <h2 className="step-title">{current.title}</h2>

        {/* Grid options */}
        {current.type === 'grid' && (
          <div 
            className="step-options"
            // Хэрэв 1 сонголттой бол '1fr', үгүй бол '1fr 1fr' болгох код:
            style={{ gridTemplateColumns: current.options.length === 1 ? '1fr' : '1fr 1fr' }}
          >
            {current.options.map(opt => (
              <div
                key={opt.value}
                className={`step-option${choices[current.key] === opt.value ? ' selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                <div className="opt-emoji">{opt.emoji}</div>
                <div className="opt-name">{opt.name}</div>
                {opt.desc && <div className="opt-desc">{opt.desc}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Time options */}
        {current.type === 'time' && (
          <div className="time-options">
            {current.options.map(opt => (
              <div
                key={opt.value}
                className={`time-chip${choices[current.key] === opt.value ? ' selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
          {step > 0 && (
            <button
              className="btn btn-ghost"
              style={{ padding: '12px 28px', fontSize: '0.9rem' }}
              onClick={handleBack}
            >
              ← Буцах
            </button>
          )}
          <button
            className="btn btn-magic"
            style={{ padding: '12px 36px', fontSize: '0.95rem' }}
            disabled={!isSelected}
            onClick={handleNext}
          >
            {step < totalSteps - 1 ? 'Дараагийх →' : 'Баталгаажуулах ✨'}
          </button>
        </div>
      </div>
    </div>
  )
}
