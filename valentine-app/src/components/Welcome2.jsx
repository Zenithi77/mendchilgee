import { useState, useEffect } from "react";

export default function Welcome2({ startDate, onOpen, template }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Date.now() - startDate.getTime();
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [startDate]);

  const welcome = template?.welcome || {};
  const character = welcome.character || {};
  const timer = welcome.timer || {};

  return (
    <div className="page page-enter">
      <div
        className="glass"
        style={{
          padding: "48px 38px",
          textAlign: "center",
          maxWidth: 480,
          width: "100%",
        }}
      >
        {/* Character / Envelope based on template */}
        {character.type === "bear" ? (
          <div className="envelope-wrap">
            <div className="envelope">
              <div className="env-letter">
                {character.envelopeEmojis?.letter || "💌"}
              </div>
              <div className="env-body" />
              <div className="env-flap" />
              <div className="env-heart">
                {character.envelopeEmojis?.heart || "💝"}
              </div>
            </div>
          </div>
        ) : character.type === "emoji" ? (
          <div className={character.wrapClass || "welcome-char"}>
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
          </div>
        ) : null}

        <h1
          className="font-script"
          style={{
            fontSize: "2.4rem",
            color: "var(--t-primary, var(--pink))",
            marginBottom: 8,
            textShadow: "0 0 40px rgba(255,107,157,0.3)",
          }}
        >
          {welcome.title || "Happy Valentine's Day 💕"}
        </h1>
        <p
          style={{
            fontSize: "0.92rem",
            color: "rgba(255,255,255,0.6)",
            marginBottom: 28,
            lineHeight: 1.7,
            whiteSpace: "pre-line",
          }}
        >
          {welcome.subtitle ||
            "Хамгийн хайртай хүндээ зориулсан\nтусгай урилга ❤️"}
        </p>

        {/* Timer */}
        <div className="welcome-timer-box">
          <div
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 8,
            }}
          >
            {timer.title || "Бид хамт байсан хугацаа"}
          </div>
          <div className="timer-grid">
            {[
              [time.d, timer.labels?.days || "Өдөр"],
              [time.h, timer.labels?.hours || "Цаг"],
              [time.m, timer.labels?.minutes || "Минут"],
              [time.s, timer.labels?.seconds || "Секунд"],
            ].map(([val, label]) => (
              <div className="timer-box" key={label}>
                <div className="timer-num">{val}</div>
                <div className="timer-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-love" onClick={onOpen}>
          {welcome.buttonText || "Урилга нээх 💌"}
        </button>
      </div>
    </div>
  );
}
