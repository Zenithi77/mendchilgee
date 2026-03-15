import { useState, useCallback, useMemo } from "react";
import "./SpecialQuestions.css";

/**
 * SpecialQuestions — 4 хурууны асуулт бүхий special section.
 *
 * Асуулт 1-3: Ганц зөв хариулттай quiz. Буруу → улаан, Зөв → ногоон + тайлбар.
 * Асуулт 4:   Бүх хариулт "буруу" (улаан). Бүгдийг сонгоход нийлж нэг нууц
 *             хайрцаг болно → дарахад "Бүх зүйлд чинь дуртай" гарч ирнэ.
 */
export default function SpecialQuestions({ data, onContinue, category }) {
  const isMilitary = category === "soldiers-day";
  const questions = useMemo(() => data?.questions || (isMilitary ? DEFAULT_QUESTIONS_MILITARY : DEFAULT_QUESTIONS), [data, isMilitary]);
  const [qIdx, setQIdx] = useState(0);

  // Wrap per-question state in an inner component controlled by key
  return (
    <QuestionStep
      key={qIdx}
      questions={questions}
      qIdx={qIdx}
      setQIdx={setQIdx}
      onContinue={onContinue}
    />
  );
}

function QuestionStep({ questions, qIdx, setQIdx, onContinue }) {
  const [selectedMap, setSelectedMap] = useState({});
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  // Q4 states
  const [q4Revealed, setQ4Revealed] = useState({});
  const [allRevealedQ4, setAllRevealedQ4] = useState(false);
  const [boxOpened, setBoxOpened] = useState(false);
  const [showFinalText, setShowFinalText] = useState(false);

  const q = questions[qIdx];
  const isLastQuestion = q?.allWrong;

  // Q1-Q3: Handle selection
  const handleSelectNormal = useCallback(
    (idx) => {
      if (answered) return;
      const isCorrect = idx === q.correctIndex;
      setSelectedMap((prev) => ({ ...prev, [idx]: true }));

      if (isCorrect) {
        // Correct! mark answered and show explanation
        setAnswered(true);
        setTimeout(() => setShowExplanation(true), 400);
      }
      // Wrong: just highlight red, let user try again
    },
    [answered, q],
  );

  // Q4: Handle selection (all are "wrong")
  const handleSelectQ4 = useCallback(
    (idx) => {
      if (allRevealedQ4) return;
      setQ4Revealed((prev) => {
        const next = { ...prev, [idx]: true };
        // Check if all options are now revealed
        if (Object.keys(next).length === q.options.length) {
          setTimeout(() => setAllRevealedQ4(true), 600);
        }
        return next;
      });
    },
    [allRevealedQ4, q],
  );

  const goNext = useCallback(() => {
    if (qIdx < questions.length - 1) {
      setQIdx((i) => i + 1);
    } else {
      onContinue?.();
    }
  }, [qIdx, questions.length, onContinue, setQIdx]);

  const handleBoxClick = () => {
    if (!allRevealedQ4) return;
    setBoxOpened(true);
    setTimeout(() => setShowFinalText(true), 500);
  };

  if (!q) return null;

  /* ── Q4: Special "all wrong" question ── */
  if (isLastQuestion) {
    return (
      <div className="page page-enter">
        <div className="glass sq-glass">
          {/* Progress */}
          <div className="sq-progress">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`sq-dot ${i === qIdx ? "active" : ""} ${i < qIdx ? "done" : ""}`}
              />
            ))}
          </div>

          <h2 className="sq-question font-script">{q.text}</h2>

          {!allRevealedQ4 && (
            <div className="sq-options">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`sq-option ${q4Revealed[i] ? "wrong shake" : ""}`}
                  onClick={() => handleSelectQ4(i)}
                  disabled={q4Revealed[i]}
                >
                  <span className="sq-opt-emoji">{opt.emoji}</span>
                  <span className="sq-opt-name">{opt.name}</span>
                  {q4Revealed[i] && <span className="sq-x-mark">✗</span>}
                </button>
              ))}
            </div>
          )}

          {/* Mystery box appears after all options exhausted */}
          {allRevealedQ4 && !showFinalText && (
            <div className="sq-mystery-box-wrap" onClick={handleBoxClick}>
              <div className={`sq-mystery-box ${boxOpened ? "opening" : ""}`}>
                <div className="sq-box-lid">
                  <span className="sq-box-ribbon">{isMilitary ? "🎖️" : "🎀"}</span>
                </div>
                <div className="sq-box-body">
                  <span className="sq-box-q">?</span>
                </div>
                <div className="sq-box-sparkles">
                  <span className="sq-sparkle s1">✨</span>
                  <span className="sq-sparkle s2">{isMilitary ? "⭐" : "💖"}</span>
                  <span className="sq-sparkle s3">⭐</span>
                  <span className="sq-sparkle s4">✨</span>
                </div>
              </div>
              <p className="sq-box-hint">{isMilitary ? "Нууц хайрцгийг нээгээрэй 🎖️" : "Нууц хайрцгийг нээгээрэй 💝"}</p>
            </div>
          )}

          {/* Final reveal text */}
          {showFinalText && (
            <div className="sq-final-reveal">
              <div className="sq-firework-burst">
                <span className="sq-fw fw1">🎆</span>
                <span className="sq-fw fw2">✨</span>
                <span className="sq-fw fw3">{isMilitary ? "🎖️" : "💖"}</span>
                <span className="sq-fw fw4">🎇</span>
                <span className="sq-fw fw5">✨</span>
                <span className="sq-fw fw6">⭐</span>
              </div>
              <h2 className="sq-reveal-text font-script">
                {q.revealText || (isMilitary ? "Баатар шүү чи 🎖️" : "Бүх зүйлд чинь дуртай 💖")}
              </h2>
              <button className="sq-next-btn glow" onClick={goNext}>
                Үргэлжлүүлэх ✨
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Q1-Q3: Normal quiz question ── */
  const correctIdx = q.correctIndex;

  return (
    <div className="page page-enter">
      <div className="glass sq-glass">
        {/* Progress dots */}
        <div className="sq-progress">
          {questions.map((_, i) => (
            <span
              key={i}
              className={`sq-dot ${i === qIdx ? "active" : ""} ${i < qIdx ? "done" : ""}`}
            />
          ))}
        </div>

        <h2 className="sq-question font-script">{q.text}</h2>

        <div className="sq-options">
          {q.options.map((opt, i) => {
            const isSelected = !!selectedMap[i];
            const isCorrect = i === correctIdx;

            let cls = "sq-option";
            if (isSelected && isCorrect) cls += " correct";
            if (isSelected && !isCorrect) cls += " wrong shake";

            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleSelectNormal(i)}
                disabled={answered || isSelected}
              >
                <span className="sq-opt-emoji">{opt.emoji}</span>
                <span className="sq-opt-name">{opt.name}</span>
                {isSelected && isCorrect && (
                  <span className="sq-check-mark">✓</span>
                )}
                {isSelected && !isCorrect && (
                  <span className="sq-x-mark">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation text (slides in) */}
        {showExplanation && q.explanation && (
          <div className="sq-explanation correct">
            <span>{q.explanation}</span>
          </div>
        )}

        {answered && (
          <button className="sq-next-btn" onClick={goNext}>
            {qIdx < questions.length - 1 ? "Дараах ➨" : "Үргэлжлүүлэх ✨"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Default questions ── */
const DEFAULT_QUESTIONS = [
  {
    text: "Би чамд хайртай болоод хэдэн жил болсон бэ?",
    options: [
      { emoji: "1️⃣", name: "1 жил" },
      { emoji: "2️⃣", name: "2 жил" },
      { emoji: "3️⃣", name: "3 жил" },
      { emoji: "4️⃣", name: "4 жил" },
    ],
    correctIndex: 1,
    explanation: "Тэр өдрийг үнэхээр тод санаж байна ✨",
  },
  {
    text: "Би чамайг өдөрт хэдэн удаа боддог гэж бодож байна?",
    options: [
      { emoji: "1️⃣", name: "1 удаа" },
      { emoji: "🔟", name: "10 удаа" },
      { emoji: "💯", name: "100 удаа" },
      { emoji: "🔢", name: "1000 удаа" },
    ],
    correctIndex: 0,
    explanation:
      "Өглөө сэрэхдээ нэг бодоод, унтах хүртлээ бодсоор л байдаг 💭❤️",
  },
  {
    text: "Яг одоо би чамд юу гэж хэлмээр байгаа гэж бодож байна?",
    options: [
      { emoji: "❤️", name: "Хайртай шүү" },
      { emoji: "😍", name: "Чи үнэхээр үзэсгэлэнтэй" },
      { emoji: "🤗", name: "Хурдан уулзмаар байна" },
      { emoji: "💖", name: "Бүгд" },
    ],
    correctIndex: 3,
    explanation: "Ойлгомжтой биздээ 😊✨",
  },
  {
    text: "Чиний юу хамгийн их таалагддаг гэж бодож байна?",
    allWrong: true,
    options: [
      { emoji: "😊", name: "Инээмсэглэл" },
      { emoji: "💎", name: "Зан чанар" },
      { emoji: "👀", name: "Нүд" },
      { emoji: "💄", name: "Чиний гоо үзэсгэлэн" },
    ],
    revealText: "Бүх зүйлд чинь дуртай 💖",
  },
];

/* ── Military-themed default questions ── */
const DEFAULT_QUESTIONS_MILITARY = [
  {
    text: "Цэргийн алба хэдэн жил хааж байсан бэ?",
    options: [
      { emoji: "1️⃣", name: "1 жил" },
      { emoji: "2️⃣", name: "2 жил" },
      { emoji: "3️⃣", name: "3 жил" },
      { emoji: "4️⃣", name: "4+ жил" },
    ],
    correctIndex: 0,
    explanation: "Эх орныхоо төлөө зүтгэсэн он жилүүд ⭐",
  },
  {
    text: "Цэргийн албанд хамгийн их юу сурсан бэ?",
    options: [
      { emoji: "💪", name: "Тэвчээр" },
      { emoji: "🛡️", name: "Зориг" },
      { emoji: "🤝", name: "Нөхөрлөл" },
      { emoji: "⭐", name: "Бүгдийг" },
    ],
    correctIndex: 3,
    explanation: "Цэргийн алба бол жинхэнэ эрийн сургууль 🎖️",
  },
  {
    text: "Цэргийн баяраар юу хамгийн их хүсдэг вэ?",
    options: [
      { emoji: "🎖️", name: "Хүндэтгэл" },
      { emoji: "🏅", name: "Бахархал" },
      { emoji: "🤗", name: "Гэр бүлтэйгээ" },
      { emoji: "🎖️", name: "Бүгд" },
    ],
    correctIndex: 3,
    explanation: "Бүгд л чухал 🇲🇳⭐",
  },
  {
    text: "Чиний хамгийн гайхалтай чанар юу вэ?",
    allWrong: true,
    options: [
      { emoji: "💪", name: "Хүч чадал" },
      { emoji: "🛡️", name: "Зоригтой" },
      { emoji: "🎖️", name: "Хатуужил" },
      { emoji: "🦅", name: "Эрэлхэг зан" },
    ],
    revealText: "Баатар шүү чи 🎖️",
  },
];
