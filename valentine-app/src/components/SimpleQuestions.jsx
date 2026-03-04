import { useState, useCallback } from "react";
import "./SimpleQuestions.css";

// ═══════════════════════════════════════════════════════════════
// SimpleQuestions — Clean, minimal Q&A section
// Builder adds questions, recipient types answers one at a time
// ═══════════════════════════════════════════════════════════════

export default function SimpleQuestions({ data, onContinue }) {
  const questions = data?.questions || [];
  const title = data?.title || "Асуулт хариулт";
  const subtitle = data?.subtitle || "";
  const continueBtn = data?.continueButton || "Үргэлжлүүлэх";

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [anim, setAnim] = useState("in");
  const [done, setDone] = useState(false);

  const total = questions.length;
  const current = questions[currentIdx];

  const setAnswer = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const goNext = useCallback(() => {
    if (currentIdx < total - 1) {
      setAnim("out");
      setTimeout(() => {
        setCurrentIdx((i) => i + 1);
        setAnim("in");
      }, 300);
    } else {
      setAnim("out");
      setTimeout(() => setDone(true), 300);
    }
  }, [currentIdx, total]);

  const goBack = useCallback(() => {
    if (currentIdx > 0) {
      setAnim("out-back");
      setTimeout(() => {
        setCurrentIdx((i) => i - 1);
        setAnim("in");
      }, 300);
    }
  }, [currentIdx]);

  /* ── Done screen ── */
  if (done) {
    return (
      <div className="sq-scene">
        <div className="sq-done sq-anim-in">
          <div className="sq-done-icon">✓</div>
          <h2 className="sq-done-title">Баярлалаа!</h2>
          <p className="sq-done-sub">Хариултууд чинь амжилттай бүртгэгдлээ</p>
          <button className="sq-btn sq-btn-primary" onClick={onContinue}>
            {continueBtn}
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const currentAnswer = answers[current.id] || "";
  const answered = currentAnswer.trim().length > 0;

  return (
    <div className="sq-scene">
      {/* Header */}
      <div className="sq-header">
        <h2 className="sq-title">{title}</h2>
        {subtitle && <p className="sq-subtitle">{subtitle}</p>}
      </div>

      {/* Progress */}
      <div className="sq-progress">
        <div className="sq-progress-bar">
          <div
            className="sq-progress-fill"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>
        <span className="sq-progress-text">
          {currentIdx + 1} / {total}
        </span>
      </div>

      {/* Question card */}
      <div className={`sq-card sq-anim-${anim}`}>
        <div className="sq-card-number">{currentIdx + 1}</div>
        <h3 className="sq-card-question">{current.question}</h3>
        <textarea
          className="sq-card-input"
          value={currentAnswer}
          onChange={(e) => setAnswer(current.id, e.target.value)}
          placeholder={current.placeholder || "Хариултаа бичээрэй..."}
          rows={3}
          autoFocus
        />
      </div>

      {/* Navigation */}
      <div className="sq-nav">
        <button
          className="sq-btn sq-btn-back"
          onClick={goBack}
          disabled={currentIdx === 0}
        >
          ← Өмнөх
        </button>
        <button
          className={`sq-btn sq-btn-next ${answered ? "sq-btn-active" : ""}`}
          onClick={goNext}
        >
          {currentIdx < total - 1 ? "Дараах →" : "Дуусгах ✓"}
        </button>
      </div>
    </div>
  );
}
