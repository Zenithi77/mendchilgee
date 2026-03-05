import { useState, useCallback, useEffect, useRef } from "react";
import "./SimpleQuestions.css";

// ═══════════════════════════════════════════════════════════════
// SimpleQuestions — Cinematic Q&A with floating particles
// ═══════════════════════════════════════════════════════════════

/* ── Floating particle layer ── */
const PARTICLE_DATA = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  dur: 6 + Math.random() * 10,
  delay: Math.random() * 8,
  opacity: 0.15 + Math.random() * 0.3,
}));

function Particles() {
  return (
    <div className="sq-particles">
      {PARTICLE_DATA.map((d) => (
        <span
          key={d.id}
          className="sq-particle"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function SimpleQuestions({ data, onContinue, onAnswersSubmit }) {
  const questions = data?.questions || [];
  const title = data?.title || "Асуулт хариулт";
  const subtitle = data?.subtitle || "";
  const continueBtn = data?.continueButton || "Үргэлжлүүлэх";

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [anim, setAnim] = useState("in");
  const [done, setDone] = useState(false);
  const [entered, setEntered] = useState(false);
  const textareaRef = useRef(null);

  const total = questions.length;
  const current = questions[currentIdx];

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Auto-focus textarea on card change
  useEffect(() => {
    if (textareaRef.current && !done) {
      const t = setTimeout(() => textareaRef.current?.focus(), 400);
      return () => clearTimeout(t);
    }
  }, [currentIdx, done]);

  const setAnswer = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  // Submit answers to parent when all questions are done
  useEffect(() => {
    if (done && onAnswersSubmit) {
      const pairs = questions.map((q) => ({
        question: q.question,
        answer: answers[q.id] || "",
      }));
      onAnswersSubmit(pairs);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    if (currentIdx < total - 1) {
      setAnim("out");
      setTimeout(() => {
        setCurrentIdx((i) => i + 1);
        setAnim("in");
      }, 350);
    } else {
      setAnim("out");
      setTimeout(() => setDone(true), 350);
    }
  }, [currentIdx, total]);

  const goBack = useCallback(() => {
    if (currentIdx > 0) {
      setAnim("out-back");
      setTimeout(() => {
        setCurrentIdx((i) => i - 1);
        setAnim("in");
      }, 350);
    }
  }, [currentIdx]);

  /* ── Auto-continue when done ── */
  useEffect(() => {
    if (done && onContinue) {
      onContinue();
    }
  }, [done, onContinue]);

  if (done) return null;

  if (!current) return null;

  const currentAnswer = answers[current.id] || "";
  const answered = currentAnswer.trim().length > 0;
  const progress = ((currentIdx + 1) / total) * 100;

  return (
    <div className={`sq-scene ${entered ? "sq-entered" : ""}`}>
      <Particles />

      {/* Ambient orbs */}
      <div className="sq-orb sq-orb-1" />
      <div className="sq-orb sq-orb-2" />
      <div className="sq-orb sq-orb-3" />

      {/* Header */}
      <div className={`sq-header ${entered ? "sq-header-visible" : ""}`}>
        <h2 className="sq-title">{title}</h2>
        {subtitle && <p className="sq-subtitle">{subtitle}</p>}
      </div>

      {/* Progress */}
      <div className={`sq-progress ${entered ? "sq-progress-visible" : ""}`}>
        <div className="sq-progress-bar">
          <div className="sq-progress-fill" style={{ width: `${progress}%` }} />
          <div className="sq-progress-glow" style={{ left: `${progress}%` }} />
        </div>
        <div className="sq-progress-steps">
          {questions.map((_, i) => (
            <span
              key={i}
              className={`sq-step-dot ${i <= currentIdx ? "sq-step-done" : ""} ${i === currentIdx ? "sq-step-current" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className={`sq-card sq-anim-${anim}`}>
        <div className="sq-card-badge">
          <span className="sq-card-badge-num">{currentIdx + 1}</span>
          <span className="sq-card-badge-total">/{total}</span>
        </div>
        <h3 className="sq-card-question">{current.question}</h3>
        <div className="sq-card-input-wrap">
          <textarea
            ref={textareaRef}
            className="sq-card-input"
            value={currentAnswer}
            onChange={(e) => setAnswer(current.id, e.target.value)}
            placeholder={current.placeholder || "Хариултаа бичээрэй..."}
            rows={3}
          />
          <div className="sq-card-input-border" />
        </div>
      </div>

      {/* Navigation */}
      <div className="sq-nav">
        {currentIdx > 0 && (
          <button className="sq-btn sq-btn-back" onClick={goBack}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/></svg>
          </button>
        )}
        <button
          className={`sq-btn sq-btn-next ${answered ? "sq-btn-active" : ""}`}
          onClick={goNext}
        >
          <span>{currentIdx < total - 1 ? "Дараах" : "Дуусгах"}</span>
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            {currentIdx < total - 1
              ? <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              : <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            }
          </svg>
        </button>
      </div>
    </div>
  );
}
