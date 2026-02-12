import { useEffect, useMemo, useRef, useState, useCallback } from "react";

const DEFAULT_NO_MSGS = [
  "Үгүй гэж болохгүй 🥺",
];

export default function Question2({ onYes, template }) {
  const question = template?.question || {};
  const character = question.character;
  const textVariantsEnabled = question.noButton?.variantsEnabled ?? true;

  const noMessages = useMemo(() => {
    if (!textVariantsEnabled) return [];
    const msgs = question.noButton?.messages;
    return Array.isArray(msgs) && msgs.length ? msgs : DEFAULT_NO_MSGS;
  }, [question.noButton?.messages, textVariantsEnabled]);

  const defaultNoText = textVariantsEnabled
    ? question.noButton?.defaultText || "Үгүй 💔"
    : "Үгүй";

  const wrapRef = useRef(null);
  const yesBtnRef = useRef(null);
  const noBtnRef = useRef(null);
  const hoverArmedRef = useRef(true);
  const lastMoveAtRef = useRef(0);

  const [noCount, setNoCount] = useState(0);
  const [noStyle, setNoStyle] = useState({});
  const [noText, setNoText] = useState(defaultNoText);
  const [yesScale, setYesScale] = useState(1);

  useEffect(() => {
    setNoCount(0);
    setNoStyle({});
    setNoText(defaultNoText);
    setYesScale(1);
    hoverArmedRef.current = true;
    lastMoveAtRef.current = 0;
  }, [defaultNoText, textVariantsEnabled]);

  const moveNoButton = useCallback(() => {
    const wrapEl = wrapRef.current;
    const yesEl = yesBtnRef.current;
    const btnEl = noBtnRef.current;
    if (!wrapEl || !btnEl) return;

    // NOTE: use unscaled layout sizes so this works
    // even if parent containers apply CSS transform: scale(...)
    const wrapW = wrapEl.clientWidth;
    const wrapH = wrapEl.clientHeight;
    const btnW = btnEl.offsetWidth;
    const btnH = btnEl.offsetHeight;

    // Avoid overlapping the Yes button so it stays clickable.
    // Use DOMRects and normalize to the unscaled coordinate space.
    const getForbidden = (margin) => {
      if (!yesEl) return null;
      const wrapRect = wrapEl.getBoundingClientRect();
      const yesRect = yesEl.getBoundingClientRect();
      const scaleX = wrapEl.clientWidth ? wrapRect.width / wrapEl.clientWidth : 1;
      const scaleY = wrapEl.clientHeight ? wrapRect.height / wrapEl.clientHeight : 1;

      const yesX = (yesRect.left - wrapRect.left) / (scaleX || 1);
      const yesY = (yesRect.top - wrapRect.top) / (scaleY || 1);
      const yesW = yesRect.width / (scaleX || 1);
      const yesH = yesRect.height / (scaleY || 1);

      return {
        x: yesX - margin,
        y: yesY - margin,
        w: yesW + margin * 2,
        h: yesH + margin * 2,
      };
    };

    const padding = 8;
    const maxX = Math.max(0, wrapW - btnW - padding * 2);
    const maxY = Math.max(0, wrapH - btnH - padding * 2);

    const overlaps = (a, b) => {
      if (!b) return false;
      return !(
        a.x + a.w <= b.x ||
        b.x + b.w <= a.x ||
        a.y + a.h <= b.y ||
        b.y + b.h <= a.y
      );
    };

    let x = padding;
    let y = padding;

    const pickPosition = (forbidden) => {
      for (let attempt = 0; attempt < 28; attempt += 1) {
        const cx = padding + Math.random() * maxX;
        const cy = padding + Math.random() * maxY;
        const candidate = { x: cx, y: cy, w: btnW, h: btnH };
        if (!overlaps(candidate, forbidden)) {
          return { x: cx, y: cy, ok: true };
        }
      }
      return { x, y, ok: false };
    };

    // Progressive relaxation:
    // 1) big margin (best UX)
    // 2) small margin (when space gets tight as Yes grows)
    // 3) allow overlap (Yes remains clickable due to z-index)
    const try1 = pickPosition(getForbidden(24));
    if (try1.ok) {
      x = try1.x;
      y = try1.y;
    } else {
      const try2 = pickPosition(getForbidden(8));
      if (try2.ok) {
        x = try2.x;
        y = try2.y;
      } else {
        // No constraint; just move somewhere.
        x = padding + Math.random() * maxX;
        y = padding + Math.random() * maxY;
      }
    }

    setNoStyle({
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      zIndex: 1,
      transition: "left 0.18s ease, top 0.18s ease",
    });
  }, []);

  const handleNo = useCallback(
    (source) => {
      const now = Date.now();
      // Guard against repeated pointer events caused by the button moving
      // while the pointer is still within its bounds.
      if (now - lastMoveAtRef.current < 220) return;

      if (source === "hover") {
        if (!hoverArmedRef.current) return;
        hoverArmedRef.current = false;
      }

      lastMoveAtRef.current = now;
      moveNoButton();

      if (!textVariantsEnabled) return;

      const next = noCount + 1;
      setNoCount(next);
      setNoText(next < noMessages.length ? noMessages[next] : "😭");
      setYesScale((prev) => Math.min(prev + 0.1, 1.6));
    },
    [moveNoButton, noCount, noMessages, textVariantsEnabled],
  );

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

        <div
          className="q-btn-wrap"
          ref={wrapRef}
          style={{ minHeight: 160 }}
        >
          <button
            className="yes-btn"
            style={{ transform: `scale(${yesScale})` }}
            onClick={onYes}
            ref={yesBtnRef}
          >
            {question.yesButton?.text || "Тийм"}{" "}
            {question.yesButton?.emoji || "❤️"}
          </button>
          <button
            className="no-btn"
            style={noStyle}
            ref={noBtnRef}
            onPointerEnter={() => handleNo("hover")}
            onPointerDown={() => handleNo("press")}
            onPointerLeave={() => {
              hoverArmedRef.current = true;
            }}
          >
            {noText}
          </button>
        </div>
      </div>
    </div>
  );
}
