import { useEffect, useMemo, useRef, useState } from "react";
import { SECTION_TYPES } from "../models/gift";
import { SECTION_REGISTRY } from "../sections/sectionRegistry";

const VIEWPORTS = {
  desktop: { label: "Desktop", width: 1200, height: 720 },
  tablet: { label: "Tablet", width: 820, height: 720 },
  mobile: { label: "Mobile", width: 390, height: 720 },
};

function WelcomePreview({ data }) {
  const title = data?.title ?? "Гэгээн Валентины мэнд! 💝";
  const subtitle = data?.subtitle ?? "Таны аялал эндээс эхэлнэ ✨";
  const buttonText = data?.buttonText ?? "Үргэлжлүүлэх";
  const ch = data?.character;
  const bodyEmoji = ch?.bodyEmoji ?? "💝";
  const accents = Array.isArray(ch?.accents) ? ch.accents : ["✨", "💫", "⭐"];

  return (
    <div className="pv-card pv-welcome">
      <div className="pv-welcome-icon">
        <span className="pv-welcome-emoji">{bodyEmoji}</span>
        <div className="pv-welcome-accents">
          {accents.slice(0, 5).map((a, i) => (
            <span key={i} className="pv-accent">
              {a}
            </span>
          ))}
        </div>
      </div>

      <h1 className="pv-title">{title}</h1>
      <p className="pv-subtitle">{subtitle}</p>

      <button className="pv-primary-btn" type="button">
        {buttonText}
      </button>

      <div className="pv-divider" />

      <div className="pv-timer">
        <div className="pv-timer-title">{data?.timer?.title ?? "Бидний хугацаа"}</div>
        <div className="pv-timer-grid">
          <div className="pv-timer-item">
            <div className="pv-timer-num">12</div>
            <div className="pv-timer-label">{data?.timer?.labels?.days ?? "Өдөр"}</div>
          </div>
          <div className="pv-timer-item">
            <div className="pv-timer-num">03</div>
            <div className="pv-timer-label">{data?.timer?.labels?.hours ?? "Цаг"}</div>
          </div>
          <div className="pv-timer-item">
            <div className="pv-timer-num">18</div>
            <div className="pv-timer-label">{data?.timer?.labels?.minutes ?? "Минут"}</div>
          </div>
          <div className="pv-timer-item">
            <div className="pv-timer-num">45</div>
            <div className="pv-timer-label">{data?.timer?.labels?.seconds ?? "Секунд"}</div>
          </div>
        </div>
        <div className="pv-timer-hint">
          (Энэ нь preview demo тоо — real timer-аа public page дээр ажиллуулна.)
        </div>
      </div>
    </div>
  );
}

function LetterPreview({ data }) {
  const content = data?.content ?? "";
  const closeText = data?.closeButtonText ?? "Уншлаа";
  const trail = Array.isArray(data?.heartTrail) ? data.heartTrail : ["💖", "💕", "💗"];
  const musicUrl = data?.music?.url;

  return (
    <div className="pv-card pv-letter">
      <div className="pv-letter-top">
        <div className="pv-chip">💌 Захидал</div>
        {musicUrl ? (
          <div className="pv-music">
            🎵 <span className="pv-music-url">{musicUrl}</span>
          </div>
        ) : null}
      </div>

      <div className="pv-letter-body">
        {content.split("\n").map((line, i) => (
          <p key={i} className="pv-letter-line">
            {line || "\u00A0"}
          </p>
        ))}
      </div>

      <div className="pv-letter-footer">
        <div className="pv-heart-trail">
          {trail.slice(0, 7).map((h, i) => (
            <span key={i}>{h}</span>
          ))}
        </div>

        <button className="pv-secondary-btn" type="button">
          {closeText} 💕
        </button>
      </div>
    </div>
  );
}

function GenericSectionPreview({ section }) {
  const reg = SECTION_REGISTRY?.[section.type];
  const label = reg?.labelMn || reg?.label || section.type;

  return (
    <div className="pv-card pv-generic">
      <div className="pv-generic-title">{label}</div>
      <div className="pv-generic-sub">
        Энэ section-ийн preview component одоогоор хийгдээгүй байна.
      </div>
    </div>
  );
}

export default function GiftPreview({ gift, viewport, focusSectionId }) {
  const outerRef = useRef(null);
  const [outerWidth, setOuterWidth] = useState(0);

  const vp = VIEWPORTS[viewport] ?? VIEWPORTS.desktop;

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      setOuterWidth(entries?.[0]?.contentRect?.width ?? 0);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = useMemo(() => {
    if (!outerWidth) return 1;
    const padding = 24;
    const available = Math.max(220, outerWidth - padding);
    return Math.min(1, available / vp.width);
  }, [outerWidth, vp.width]);

  return (
    <div className="builder-preview-outer" ref={outerRef}>
      <div className="builder-preview-center">
        <div
          className="builder-preview-frame"
          style={{
            width: vp.width,
            height: vp.height,
            transform: `scale(${scale})`,
          }}
        >
          <div className={`gift-preview-root ${gift?.theme?.className || ""}`}>
            <div className="gift-preview-theme" style={gift?.theme?.colors || {}}>
              <div className="gift-preview-stack">
                {gift?.sections?.length ? (
                  (focusSectionId
                    ? gift.sections.filter((s) => String(s.id) === String(focusSectionId))
                    : gift.sections
                  ).map((section) => {
                    if (section.type === SECTION_TYPES.WELCOME) {
                      return <WelcomePreview key={section.id} data={section.data} />;
                    }
                    if (
                      section.type === SECTION_TYPES.LOVE_LETTER ||
                      section.type === SECTION_TYPES.LETTER
                    ) {
                      return <LetterPreview key={section.id} data={section.data} />;
                    }

                    return <GenericSectionPreview key={section.id} section={section} />;
                  })
                ) : (
                  <div className="pv-empty">
                    <div className="pv-empty-title">Section нэмэгдээгүй байна</div>
                    <div className="pv-empty-sub">Зүүн талын “Хуудас нэмэх” дээр дар.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const VIEWPORT_PRESETS = VIEWPORTS;
