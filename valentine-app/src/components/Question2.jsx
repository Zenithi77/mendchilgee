import { useState, useCallback } from "react";

const DEFAULT_NO_MSGS = [
  "Үгүй гэж болохгүй 🥺",
  "Дахиад бодоод үз 💭",
  "Зүрх минь эвдэрч байна 💔",
  "Яг үнэндээ? 😢",
  "Чи дуртайл байгаа биздээ 🤔",
  "Чи битий нэрэлхээд байлдаа 😤",
  "Миний зүрх... 😭",
  "Плиииз 🥹",
  "Сүүлийн боломж чинь шүү 🤡",
];

/* ───────────── Quiz Mode Sub-component ───────────── */
function QuizMode({ quizQuestions, character, onDone }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState([]);
  const [otherText, setOtherText] = useState("");
  const [showResult, setShowResult] = useState(null); // null | "correct" | "wrong"
  const [answered, setAnswered] = useState(false);

  const q = quizQuestions[qIdx];
  if (!q) return null;

  const isQuiz = q.correctIndex !== undefined;
  const isMulti = q.multiSelect;

  const handleSelect = (idx) => {
    if (answered && isQuiz) return;
    if (isMulti) {
      setSelected((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    } else if (isQuiz) {
      setSelected([idx]);
      // Auto-check for quiz single-select
      if (idx === q.correctIndex) {
        setShowResult("correct");
      } else {
        setShowResult("wrong");
      }
      setAnswered(true);
    } else {
      setSelected((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    }
  };

  const goNext = () => {
    if (qIdx < quizQuestions.length - 1) {
      setQIdx(qIdx + 1);
      setSelected([]);
      setOtherText("");
      setShowResult(null);
      setAnswered(false);
    } else {
      onDone();
    }
  };

  const canProceed = isQuiz
    ? answered
    : selected.length > 0 || otherText.trim().length > 0;

  return (
    <div className="quiz-mode">
      {/* Progress dots */}
      <div className="quiz-progress">
        {quizQuestions.map((_, i) => (
          <span
            key={i}
            className={`quiz-dot ${i === qIdx ? "active" : ""} ${i < qIdx ? "done" : ""}`}
          />
        ))}
      </div>

      {/* Character */}
      {character?.type === "emoji" && (
        <div className={character.wrapClass || "question-char"} style={{ marginBottom: 8 }}>
          <div className={character.bodyClass || ""}>{character.bodyEmoji}</div>
          <div className={character.accentContainerClass || ""}>
            {(character.accents || []).map((emoji, i) => (
              <span key={i} className={`${character.accentItemClass || ""} s${i + 1}`}>
                {emoji}
              </span>
            ))}
          </div>
          <div className={character.pulseRingClass || "pulse-ring"} />
        </div>
      )}

      <h2
        className="font-script"
        style={{
          fontSize: "1.7rem",
          color: "var(--t-primary, var(--pink))",
          marginBottom: 20,
        }}
      >
        {q.text}
      </h2>

      {/* Options grid */}
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          const isSelected = selected.includes(i);
          const isCorrectOne = isQuiz && i === q.correctIndex;
          let optClass = "quiz-option";
          if (isSelected) optClass += " selected";
          if (answered && isQuiz && isCorrectOne) optClass += " correct";
          if (answered && isQuiz && isSelected && !isCorrectOne) optClass += " wrong";

          return (
            <button
              key={i}
              className={optClass}
              onClick={() => handleSelect(i)}
              disabled={answered && isQuiz}
            >
              <span className="quiz-opt-emoji">{opt.emoji}</span>
              <span className="quiz-opt-name">{opt.name}</span>
              {isMulti && isSelected && <span className="quiz-check">✓</span>}
            </button>
          );
        })}
      </div>

      {/* "Other" freeform input */}
      {q.allowOther && (
        <div className="quiz-other">
          <input
            type="text"
            className="quiz-other-input"
            placeholder="Өөр хариулт бичих... ✏️"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
          />
        </div>
      )}

      {/* Result feedback for quiz */}
      {showResult === "correct" && (
        <div className="quiz-feedback correct-fb">
          <span className="fb-icon">🎉</span> {q.correctText}
        </div>
      )}
      {showResult === "wrong" && (
        <div className="quiz-feedback wrong-fb">
          <span className="fb-icon">💫</span> {q.correctText || "Зөв хариулт олдлоо!"}
        </div>
      )}

      {/* Next / Done button */}
      {canProceed && (
        <button className="quiz-next-btn" onClick={goNext}>
          {qIdx < quizQuestions.length - 1 ? "Дараах ➜" : "Үргэлжлүүлэх 💕"}
        </button>
      )}
    </div>
  );
}

/* ───────────── Main Question2 Component ───────────── */
export default function Question2({ onYes, template }) {
  const question = template?.question || {};
  const character = question.character;
  const noMessages = question.noButton?.messages || DEFAULT_NO_MSGS;
  const defaultNoText = question.noButton?.defaultText || "Үгүй 💔";

  const [noCount, setNoCount] = useState(0);
  const [noStyle, setNoStyle] = useState({});
  const [noText, setNoText] = useState(defaultNoText);
  const [yesScale, setYesScale] = useState(1);

  const handleNo = useCallback(() => {
    const rx = (Math.random() - 0.5) * 220;
    const ry = (Math.random() - 0.5) * 160;

    setNoStyle({
      position: "absolute",
      left: `calc(50% + ${rx}px)`,
      top: `calc(50% + ${ry}px)`,
      transform: "translate(-50%, -50%)",
    });

    const next = noCount + 1;
    setNoCount(next);
    setNoText(next < noMessages.length ? noMessages[next] : "...");
    setYesScale((prev) => Math.min(prev + 0.1, 1.6));
  }, [noCount, noMessages]);

  /* ── Quiz mode ── */
  if (question.quizMode && question.quizQuestions?.length) {
    return (
      <div className="page page-enter">
        <div
          className="glass"
          style={{
            padding: "32px 24px",
            textAlign: "center",
            maxWidth: 520,
            width: "100%",
          }}
        >
          <QuizMode
            quizQuestions={question.quizQuestions}
            character={character}
            onDone={onYes}
          />
        </div>
      </div>
    );
  }

  /* ── Classic yes/no mode ── */
  return (
    <div className="page page-enter">
      <div
        className="glass"
        style={{
          padding: "44px 36px",
          textAlign: "center",
          maxWidth: 500,
          width: "100%",
        }}
      >
        {/* Character */}
        {character?.type === "bear" ? (
          <div className="bear-wrap">
            <div className="bear">
              <div className="bear-ear bear-ear-l" />
              <div className="bear-ear bear-ear-r" />
              <div className="bear-head">
                <div className="bear-eye bear-eye-l" />
                <div className="bear-eye bear-eye-r" />
                <div className="bear-face" />
                <div className="bear-nose" />
                <div className="bear-blush bear-blush-l" />
                <div className="bear-blush bear-blush-r" />
              </div>
              <div className="bear-body" />
              <div className="bear-love">{character.loveEmoji || "💗"}</div>
            </div>
            <div className={character.pulseRingClass || "pulse-ring"} />
          </div>
        ) : character?.type === "emoji" ? (
          <div className={character.wrapClass || "question-char"}>
            <div className={character.bodyClass || ""}>
              {character.bodyEmoji}
            </div>
            <div className={character.accentContainerClass || ""}>
              {(character.accents || []).map((emoji, i) => (
                <span
                  key={i}
                  className={`${character.accentItemClass || ""} s${i + 1}`}
                >
                  {emoji}
                </span>
              ))}
            </div>
            <div className={character.pulseRingClass || "pulse-ring"} />
          </div>
        ) : null}

        <h2
          className="font-script"
          style={{
            fontSize: "2.1rem",
            color: "var(--t-primary, var(--pink))",
            marginBottom: 32,
          }}
        >
          {question.text || "Чи намайг хайрладаг юу? 🥺"}
        </h2>

        <div className="q-btn-wrap">
          <button
            className="yes-btn"
            style={{ transform: `scale(${yesScale})` }}
            onClick={onYes}
          >
            {question.yesButton?.text || "Тийм"}{" "}
            {question.yesButton?.emoji || "❤️"}
          </button>
          <button
            className="no-btn"
            style={noStyle}
            onMouseEnter={handleNo}
            onClick={handleNo}
          >
            {noText}
          </button>
        </div>
      </div>
    </div>
  );
}
