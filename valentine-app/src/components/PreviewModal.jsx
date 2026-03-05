import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { giftToTemplate, SECTION_TYPES } from "../models/gift";
import { SECTION_REGISTRY } from "../sections/sectionRegistry";
import GiftRenderer from "./GiftRenderer";
import { MdCardGiftcard, MdVisibility, MdClose, MdRefresh } from "react-icons/md";
import { IoMdDesktop, IoMdPhonePortrait } from "react-icons/io";
import "./PreviewModal.css";

/**
 * PreviewModal — full-screen preview overlay.
 *
 * mode="section"  → preview a single section in a phone-like frame.
 * mode="full"     → render the entire gift flow via GiftRenderer (iframe-based with device toggle).
 */
export default function PreviewModal({
  open,
  onClose,
  gift,
  section = null,
  mode = "section", // "section" | "full"
  startDate,
  category,
}) {
  const template = useMemo(() => giftToTemplate(gift), [gift]);
  const [device, setDevice] = useState("mobile"); // "desktop" | "mobile"
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef(null);
  const screenRef = useRef(null);
  const [iframeScale, setIframeScale] = useState(1);
  const [iframeHeight, setIframeHeight] = useState(900);

  // Send gift data to preview iframe
  const sendGiftToIframe = useCallback(() => {
    if (!iframeRef.current?.contentWindow || !gift) return;
    const msg = { type: "builder-preview-data", gift };
    try {
      iframeRef.current.contentWindow.postMessage(msg, window.location.origin);
    } catch {}
  }, [gift]);

  // Listen for iframe ready
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "builder-preview-ready") {
        sendGiftToIframe();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [open, sendGiftToIframe]);

  // Send gift data whenever gift changes while open
  useEffect(() => {
    if (open) sendGiftToIframe();
  }, [open, sendGiftToIframe]);

  // Responsive iframe scaling
  useEffect(() => {
    if (!open) return;
    const el = screenRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        const renderWidth = device === "mobile" ? 430 : 1200;
        const s = w / renderWidth;
        setIframeScale(s);
        setIframeHeight(Math.ceil(h / s));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, device]);

  if (!open) return null;

  const themeStyle = gift.theme?.colors || {};

  // Full preview mode with iframe
  if (mode === "full") {
    return (
      <div className="preview-modal-overlay preview-modal-fullscreen" onClick={onClose}>
        <div className="preview-modal-container preview-modal-full-container" onClick={(e) => e.stopPropagation()}>
          {/* Header with device toggle */}
          <div className="preview-modal-header">
            <span className="preview-modal-title">
              <MdCardGiftcard /> Урьдчилан харах
            </span>
            <div className="preview-modal-device-toggle">
              <button
                type="button"
                className={`preview-modal-device-btn ${device === "desktop" ? "active" : ""}`}
                onClick={() => setDevice("desktop")}
              >
                <IoMdDesktop /> Desktop
              </button>
              <button
                type="button"
                className={`preview-modal-device-btn ${device === "mobile" ? "active" : ""}`}
                onClick={() => setDevice("mobile")}
              >
                <IoMdPhonePortrait /> Mobile
              </button>
              <button
                type="button"
                className="preview-modal-device-btn preview-modal-reload"
                onClick={() => setReloadKey((k) => k + 1)}
                title="Шинэчлэх"
              >
                <MdRefresh />
              </button>
            </div>
            <button className="preview-modal-close" onClick={onClose}>
              <MdClose />
            </button>
          </div>

          {/* Preview body */}
          <div className="preview-modal-body preview-modal-full-body">
            <div className={`preview-modal-device-wrap ${device === "mobile" ? "mobile-mode" : "desktop-mode"}`}>
              {device === "mobile" ? (
                <div className="preview-modal-phone-frame">
                  <div className="preview-modal-phone-notch" />
                  <div className="preview-modal-phone-screen" ref={screenRef}>
                    <iframe
                      ref={iframeRef}
                      key={`preview-iframe-${reloadKey}`}
                      className="preview-modal-iframe"
                      src="/preview"
                      title="Урьдчилан харах"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      style={{
                        transform: `scale(${iframeScale})`,
                        width: "430px",
                        height: `${iframeHeight}px`,
                      }}
                    />
                  </div>
                  <div className="preview-modal-phone-home-bar" />
                </div>
              ) : (
                <div className="preview-modal-desktop-screen" ref={screenRef}>
                  <iframe
                    ref={iframeRef}
                    key={`preview-iframe-${reloadKey}`}
                    className="preview-modal-iframe"
                    src="/preview"
                    title="Урьдчилан харах"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    style={{
                      transform: `scale(${iframeScale})`,
                      width: "1200px",
                      height: `${iframeHeight}px`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Section preview mode (original behavior)
  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div
        className="preview-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="preview-modal-header">
          <span className="preview-modal-title">
            <MdVisibility /> Preview
          </span>
          <button className="preview-modal-close" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        {/* Content */}
        <div className="preview-modal-body">
          <div
            className={`preview-modal-frame app ${gift.theme?.className || ""}`}
            style={themeStyle}
          >
            {section ? (
              <SingleSectionPreview
                section={section}
                template={template}
                category={category || gift.category}
                startDate={startDate}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleSectionPreview({ section, template, category, startDate }) {
  const entry = SECTION_REGISTRY[section.type];
  if (!entry) return null;

  const Component = entry.component;
  const noop = () => {};

  switch (section.type) {
    case SECTION_TYPES.WELCOME:
      return (
        <Component
          startDate={startDate || new Date()}
          onOpen={noop}
          template={template}
          category={category}
        />
      );
    case SECTION_TYPES.LOVE_LETTER:
      return <Component letter={template.loveLetter} onClose={noop} />;
    case SECTION_TYPES.QUESTION:
      return <Component onYes={noop} template={template} />;
    case SECTION_TYPES.MOVIE_SELECTION:
      return (
        <Component
          onContinue={noop}
          template={template}
          selectedMovie={null}
          onSelectMovie={noop}
        />
      );
    case SECTION_TYPES.MEMORY_GALLERY:
      return (
        <Component
          memories={template.memoryGallery?.memories || []}
          onContinue={noop}
          template={template}
        />
      );
    case SECTION_TYPES.FUN_QUESTIONS:
      return <Component data={section.data} onContinue={noop} />;
    case SECTION_TYPES.FINAL_SUMMARY:
      return <Component choices={{}} template={template} category={category} />;
    default:
      return null;
  }
}
