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
