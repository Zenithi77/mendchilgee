export default function Welcome2({ startDate, onOpen, template, category }) {
  const welcome = template?.welcome || {};
  const character = welcome.character || {};
  const isMilitary = category === "soldiers-day";

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
            color: isMilitary ? "#D4A853" : "#FF85A2",
            marginBottom: 8,
            textShadow: isMilitary
              ? "0 0 40px rgba(212,168,83,0.5), 0 2px 60px rgba(44,111,173,0.3)"
              : "0 0 40px rgba(255,133,162,0.5)",
            letterSpacing: isMilitary ? "1px" : "normal",
          }}
        >
          {welcome.title || "Мэндчилгээ 🎉"}
        </h1>
        <p
          style={{
            fontSize: "0.92rem",
            color: isMilitary ? "#B8C4D0" : "#FFC4D0",
            marginBottom: 28,
            lineHeight: 1.7,
            whiteSpace: "pre-line",
            textShadow: isMilitary ? "0 0 20px rgba(184, 196, 208, 0.15)" : "none",
          }}
        >
          {welcome.subtitle ||
            "Танд зориулсан \nтусгай мэндчилгээ ✨"}
        </p>

        <button className="btn btn-love" onClick={onOpen}>
          {welcome.buttonText || "Мэндчилгээ нээх 🎁"}
        </button>
      </div>
    </div>
  );
}
