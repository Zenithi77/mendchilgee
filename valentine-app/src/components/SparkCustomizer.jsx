import { useMemo, useState } from "react";
import YouTubeAudioPlayer from "./YouTubeAudioPlayer";
import {
  buildYouTubeEmbedSrc,
  buildYouTubeEmbedVideoSrc,
} from "../utils/youtube";

const FALLBACK_QUESTIONS = [
  { q: "Намайг хир сайн мэдэх вэ?", a1: "Кино 🎬", a2: "Үдэшлөг 💃" },
  { q: "Кофе эсвэл цай?", a1: "Кофе ☕", a2: "Цай 🍵" },
];

export default function SparkCustomizer({
  value,
  onChange,
  onContinue,
  template,
}) {
  const sc = template?.sparkCustomizer || {};
  const questions = sc.defaultQuestions || FALLBACK_QUESTIONS;
  const headerStickers = sc.stickers || ["💘", "🌹", "🎀", "🍫", "💌", "✨"];
  const phoneStickers = sc.phoneStickers || ["💞", "🌸", "✨", "💗"];
  const placeholder = sc.phonePlaceholder || {
    heart: "💖",
    text: "Мэндчилгээ",
    sub: "Танд зориулсан тусгай хуудас 💌",
  };
  const cta = sc.phoneCTA || {
    title: "Мэндчилгээ 🎉",
    sub: "Танд зориулав 🌹",
  };
  const musicBar = sc.musicBar || {
    icon: "🎵",
    title: "Your Song",
    sub: "YouTube",
  };
  const labels = sc.labels || {};

  const [revealHover, setRevealHover] = useState(false);
  const [playing, setPlaying] = useState(false);

  const youtubeOk = useMemo(() => {
    return Boolean(
      buildYouTubeEmbedSrc(value?.youtubeUrl || "", { autoplay: false }),
    );
  }, [value?.youtubeUrl]);

  const embedVideoSrc = useMemo(() => {
    const raw = (value?.embedVideoUrl || "").trim();
    if (!raw) return "";

    // Prefer YouTube normalization to guarantee autoplay+mute.
    const yt = buildYouTubeEmbedVideoSrc(raw, { autoplay: true, muted: true });
    if (yt) return yt;

    // Otherwise, accept direct iframe/embed URL as-is.
    try {
      const url = new URL(raw);
      if (url.protocol === "http:" || url.protocol === "https:") return raw;
    } catch {
      // ignore
    }
    return "";
  }, [value?.embedVideoUrl]);

  const mediaKind = value?.mediaKind || "image";
  const mediaUrl = value?.mediaUrl || "";

  const setField = (patch) => {
    onChange?.({
      youtubeUrl: value?.youtubeUrl || "",
      title: value?.title || "",
      mediaKind: value?.mediaKind || "image",
      mediaUrl: value?.mediaUrl || "",
      embedVideoUrl: value?.embedVideoUrl || "",
      ...patch,
    });
  };

  const handlePickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const kind = file.type.startsWith("video/") ? "video" : "image";
    const url = URL.createObjectURL(file);
    setField({ mediaKind: kind, mediaUrl: url });
  };

  return (
    <div className="page page-enter">
      <div className="spark-page">
        <div className="spark-header">
          <div className="spark-stickers" aria-hidden="true">
            {headerStickers.map((s, i) => (
              <span key={i} className={`spark-sticker s${i + 1}`}>
                {s}
              </span>
            ))}
          </div>

          <div className="spark-badge">{sc.badge || "2.14"}</div>
          <h1 className="font-script spark-title">
            {sc.title || "Мэндчилгээ"}
          </h1>
          <p className="spark-sub">
            {sc.subtitle || "Тусгай мэндчилгээний хуудас 🌟"}
          </p>
        </div>

        <div className="spark-grid">
          {/* Left column */}
          <div className="spark-left">
            <div
              className={`spark-reveal-card ${revealHover ? "is-revealed" : ""}`}
              onMouseEnter={() => setRevealHover(true)}
              onMouseLeave={() => setRevealHover(false)}
            >
              <div className="spark-reveal-inner">
                {!mediaUrl ? (
                  <div className="spark-reveal-placeholder">
                    <div className="spark-reveal-face">
                      {sc.revealFace || "🙂"}
                    </div>
                    <div className="spark-reveal-pill">
                      {sc.revealPill || "HOVER TO REVEAL"}
                    </div>
                  </div>
                ) : mediaKind === "video" ? (
                  <video
                    className="spark-media"
                    src={mediaUrl}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img className="spark-media" src={mediaUrl} alt="Preview" />
                )}
              </div>
              <div className="spark-reveal-mask" />
            </div>

            <div className="spark-quiz-card">
              <div className="spark-quiz-head">
                <span className="spark-quiz-dot" />
                <span className="spark-quiz-title">
                  {sc.quizTitle || "How well do you know me?"}
                </span>
              </div>
              <div className="spark-quiz-body">
                {questions.map((it, i) => (
                  <div key={i} className="spark-quiz-row">
                    <div className="spark-quiz-q">
                      {i + 1}. {it.q}
                    </div>
                    <div className="spark-quiz-answers">
                      <button type="button" className="spark-quiz-btn">
                        {it.a1}
                      </button>
                      <button type="button" className="spark-quiz-btn">
                        {it.a2}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="spark-controls-card">
              <div className="spark-control-row">
                <label className="spark-label">
                  {labels.youtubeLink || "YouTube link / embed"}
                </label>
                <input
                  className="spark-input"
                  value={value?.youtubeUrl || ""}
                  onChange={(e) => {
                    if (playing) setPlaying(false);
                    setField({ youtubeUrl: e.target.value });
                  }}
                  placeholder="Paste YouTube watch URL, youtu.be, embed, or video ID"
                />
                <div className={`spark-hint ${youtubeOk ? "ok" : ""}`}>
                  {youtubeOk
                    ? labels.youtubeHintOk ||
                      "OK — audio can play after you press Play"
                    : labels.youtubeHintTip ||
                      "Tip: paste a YouTube link (watch / youtu.be / embed)"}
                </div>
              </div>

              {/* <div className="spark-control-row">
                <label className="spark-label">Embed video link (autoplay, aspect хадгална)</label>
                <input
                  className="spark-input"
                  value={value?.embedVideoUrl || ''}
                  onChange={(e) => setField({ embedVideoUrl: e.target.value })}
                  placeholder="Paste YouTube embed link (or any https embed URL)"
                />
                <div className={`spark-hint ${embedVideoSrc ? 'ok' : ''}`}>
                  {embedVideoSrc ? 'OK — video autoplay (muted)' : 'Optional: iframe/embed link оруулбал preview дээр video гарна'}
                </div>
              </div> */}

              <div className="spark-control-row">
                <label className="spark-label">
                  {labels.coverLabel ||
                    "Cover image / video (shown вместо iframe)"}
                </label>
                <input
                  className="spark-file"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handlePickFile}
                />
                <div className="spark-hint">
                  {labels.coverHint || "Iframe харагдахгүй, зөвхөн audio явна."}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="spark-right">
            <div className="spark-phone">
              <div className="spark-phone-stickers" aria-hidden="true">
                {phoneStickers.map((s, i) => (
                  <span
                    key={i}
                    className={`spark-phone-sticker ${String.fromCharCode(97 + i)}`}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="spark-phone-frame">
                {embedVideoSrc ? (
                  <div className="spark-embed-wrap">
                    <iframe
                      className="spark-embed-iframe"
                      title="Spark Embed Video"
                      src={embedVideoSrc}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen={false}
                    />
                  </div>
                ) : !mediaUrl ? (
                  <div className="spark-phone-placeholder">
                    <div className="spark-phone-heart">{placeholder.heart}</div>
                    <div className="spark-phone-text">{placeholder.text}</div>
                    <div className="spark-phone-sub">{placeholder.sub}</div>
                  </div>
                ) : mediaKind === "video" ? (
                  <video
                    className="spark-phone-media"
                    src={mediaUrl}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img
                    className="spark-phone-media"
                    src={mediaUrl}
                    alt="Phone preview"
                  />
                )}

                <div className="spark-phone-overlay">
                  <div className="spark-phone-cta">
                    <div className="spark-phone-cta-title">{cta.title}</div>
                    <div className="spark-phone-cta-sub">{cta.sub}</div>
                  </div>
                </div>
              </div>

              <div className="spark-musicbar">
                <div className="spark-music-icon">{musicBar.icon}</div>
                <div className="spark-music-meta">
                  <div className="spark-music-title">{musicBar.title}</div>
                  <div className="spark-music-sub">{musicBar.sub}</div>
                </div>
                <div className="spark-music-actions">
                  <button
                    type="button"
                    className="spark-play"
                    onClick={() => setPlaying((p) => !p)}
                    disabled={!youtubeOk}
                    title={
                      youtubeOk
                        ? "Play/Pause"
                        : "Paste a valid YouTube link first"
                    }
                  >
                    {playing ? "⏸" : "▶"}
                  </button>
                </div>
              </div>

              <YouTubeAudioPlayer url={value?.youtubeUrl} playing={playing} />
            </div>

            <div className="spark-actions">
              <button
                type="button"
                className="btn btn-love"
                onClick={onContinue}
              >
                {sc.continueButton || "Continue 💌"}
              </button>
              <div className="spark-note">
                {sc.note ||
                  "YouTube audio нь browser policy-оос шалтгаалаад зөвхөн Play дарсны дараа асна."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
