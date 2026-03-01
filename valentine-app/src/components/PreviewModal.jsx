import { useMemo } from "react";
import { giftToTemplate, SECTION_TYPES } from "../models/gift";
import { SECTION_REGISTRY } from "../sections/sectionRegistry";
import GiftRenderer from "./GiftRenderer";
import { MdCardGiftcard, MdVisibility, MdClose } from "react-icons/md";
import "./PreviewModal.css";

/**
 * PreviewModal — full-screen preview overlay.
 *
 * mode="section"  → preview a single section in a phone-like frame.
 * mode="full"     → render the entire gift flow via GiftRenderer.
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

  if (!open) return null;

  const themeStyle = gift.theme?.colors || {};

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div
        className="preview-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="preview-modal-header">
          <span className="preview-modal-title">
            {mode === "full" ? <><MdCardGiftcard /> Бүрэн урьдчилсан харагдац</> : <><MdVisibility /> Preview</>}
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
            {mode === "full" ? (
              <GiftRenderer
                gift={gift}
                startDate={startDate || new Date()}
                category={category || gift.category}
              />
            ) : section ? (
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
    case SECTION_TYPES.STEP_QUESTIONS:
      return (
        <Component
          steps={template.stepQuestions?.steps || []}
          choices={{}}
          updateChoice={noop}
          onDone={noop}
          onBack={noop}
          template={template}
        />
      );
    case SECTION_TYPES.FINAL_SUMMARY:
      return <Component choices={{}} template={template} category={category} />;
    default:
      return null;
  }
}
