import { useState, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// FunQuestions — Paper-style questions with handwritten feel
// ═══════════════════════════════════════════════════════════════

export default function FunQuestions({ data, onContinue }) {
  const questions = data?.questions || [];
  const continueBtn = data?.continueButton || "Үргэлжлүүлэх";

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animDir, setAnimDir] = useState("in");
  const [showThank, setShowThank] = useState(false);

  const total = questions.length;
  const current = questions[currentIdx];

  const setAnswer = useCallback((qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const goNext = useCallback(() => {
    if (currentIdx < total - 1) {
      setAnimDir("out");
      setTimeout(() => {
        setCurrentIdx((i) => i + 1);
        setAnimDir("in");
      }, 320);
    } else {
      setShowThank(true);
    }
  }, [currentIdx, total]);

  const goBack = useCallback(() => {
    if (currentIdx > 0) {
      setAnimDir("out-back");
      setTimeout(() => {
        setCurrentIdx((i) => i - 1);
        setAnimDir("in");
      }, 320);
    }
  }, [currentIdx]);

  /* ── Auto-continue when done ── */
  useEffect(() => {
    if (showThank && onContinue) {
      onContinue();
    }
  }, [showThank, onContinue]);

  if (showThank) return null;

  if (!current) return null;

  const answered =
    answers[current.id] !== undefined && answers[current.id] !== "";

  return (
    <div className="fq-scene">
      {/* Dots indicator */}
      <div className="fq-dots">
        {questions.map((_, i) => (
          <span
            key={i}
            className={`fq-dot ${i === currentIdx ? "fq-dot-active" : ""} ${i < currentIdx ? "fq-dot-done" : ""}`}
          />
        ))}
      </div>

      {/* Paper card */}
      <div className={`fq-paper fq-anim-${animDir}`} key={current.id}>
        <div className="fq-paper-edge" />
        <div className="fq-paper-corner fq-corner-tl">❦</div>
        <div className="fq-paper-corner fq-corner-br">❦</div>

        <div className="fq-paper-inner">
          {/* Question number */}
          <span className="fq-qnum">
            {currentIdx + 1}/{total}
          </span>

          {/* Question text */}
          <h3 className="fq-question">{current.question}</h3>

          <div className="fq-divider">
            <span className="fq-divider-line" />
            <span className="fq-divider-ornament">✦</span>
            <span className="fq-divider-line" />
          </div>

          {/* ── Choice ── */}
          {current.type === "choice" && (
            <div className="fq-options">
              {(current.options || []).map((opt, i) => {
                const sel = answers[current.id] === opt.text;
                return (
                  <button
                    key={i}
                    className={`fq-option ${sel ? "fq-option-sel" : ""}`}
                    onClick={() => setAnswer(current.id, opt.text)}
                  >
                    <span className="fq-option-circle">
                      {sel && <span className="fq-option-dot" />}
                    </span>
                    <span className="fq-option-label">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Text ── */}
          {current.type === "text" && (
            <div className="fq-write">
              <textarea
                className="fq-write-input"
                placeholder={current.placeholder || "Энд бичнэ үү..."}
                value={answers[current.id] || ""}
                onChange={(e) => setAnswer(current.id, e.target.value)}
                rows={4}
              />
              {/* Ruled lines behind text */}
              <div className="fq-write-lines">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="fq-write-rule" />
                ))}
              </div>
            </div>
          )}

          {/* ── Emoji rating (kept simple) ── */}
          {current.type === "emoji_rate" && (
            <div className="fq-rating">
              {(current.scale || ["😐", "🙂", "😊", "🥰", "😍"]).map(
                (em, i) => {
                  const sel = answers[current.id] === i;
                  return (
                    <button
                      key={i}
                      className={`fq-rating-item ${sel ? "fq-rating-sel" : ""}`}
                      onClick={() => setAnswer(current.id, i)}
                    >
                      {em}
                    </button>
                  );
                },
              )}
            </div>
          )}

          {/* ── Yes / No ── */}
          {current.type === "yesno" && (
            <div className="fq-yesno">
              <button
                className={`fq-yn-btn ${answers[current.id] === "yes" ? "fq-yn-sel" : ""}`}
                onClick={() => setAnswer(current.id, "yes")}
              >
                Тийм
              </button>
              <span className="fq-yn-or">эсвэл</span>
              <button
                className={`fq-yn-btn ${answers[current.id] === "no" ? "fq-yn-sel" : ""}`}
                onClick={() => setAnswer(current.id, "no")}
              >
                Үгүй
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <div className="fq-nav">
        {currentIdx > 0 && (
          <button className="fq-btn fq-btn-ghost" onClick={goBack}>
            ← Буцах
          </button>
        )}
        <button
          className={`fq-btn fq-btn-primary ${!answered ? "fq-btn-off" : ""}`}
          onClick={goNext}
          disabled={!answered}
        >
          {currentIdx < total - 1 ? "Дараагийх →" : "Дуусгах"}
        </button>
      </div>
    </div>
  );
}
