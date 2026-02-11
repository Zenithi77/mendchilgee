import { useState, useCallback, useMemo, useEffect } from "react";
import { giftToTemplate, SECTION_TYPES } from "../models/gift";
import { SECTION_REGISTRY } from "../sections/sectionRegistry";
import HeartRain from "./HeartRain";

/** Build initial choices state from the stepQuestions section data. */
function buildInitialChoices(gift) {
  const stepSection = gift.sections.find(
    (s) => s.type === SECTION_TYPES.STEP_QUESTIONS,
  );
  if (!stepSection?.data?.steps) return {};
  const init = {};
  stepSection.data.steps.forEach((s) => {
    init[s.key] = s.multiSelect ? [] : null;
  });
  return init;
}

/**
 * GiftRenderer — data-driven renderer for a Gift.
 *
 * Walks through gift.sections in order, rendering each section
 * with the matching component from the section registry.
 *
 * Manages:
 *  - Section navigation (current index, next/back)
 *  - User choices state (for stepQuestions / finalSummary)
 *  - Customizer state (for sparkCustomizer)
 *  - HeartRain visual effect
 */
export default function GiftRenderer({ gift, startDate, category, initialSectionIndex = 0 }) {
  const [sectionIndex, setSectionIndex] = useState(initialSectionIndex || 0);
  const [choices, setChoices] = useState(() => buildInitialChoices(gift));
  const [customizerData, setCustomizerData] = useState({});
  const [heartRain, setHeartRain] = useState(false);

  // Reconstruct template-like object so existing components work unchanged
  const template = useMemo(() => giftToTemplate(gift), [gift]);

  const goToSection = useCallback(
    (index) => {
      window.scrollTo({ top: 0, behavior: "instant" });
      setSectionIndex(index);
      // Activate heart rain when entering memoryGallery
      const target = gift.sections[index];
      if (target?.type === SECTION_TYPES.MEMORY_GALLERY) {
        setHeartRain(true);
      }
    },
    [gift.sections],
  );

  // respond to external initial section index changes (deep-linking)
  useEffect(() => {
    setSectionIndex(initialSectionIndex || 0);
  }, [initialSectionIndex]);

  const goNext = useCallback(() => {
    const nextIndex = sectionIndex + 1;
    if (nextIndex < gift.sections.length) {
      goToSection(nextIndex);
    }
  }, [sectionIndex, gift.sections.length, goToSection]);

  const goBack = useCallback(() => {
    if (sectionIndex > 0) {
      goToSection(sectionIndex - 1);
    }
  }, [sectionIndex, goToSection]);

  const updateChoice = useCallback((key, val) => {
    setChoices((prev) => ({ ...prev, [key]: val }));
  }, []);

  // ── Render current section ──────────────────────────────────

  const currentSection = gift.sections[sectionIndex];
  if (!currentSection) return null;

  const { type } = currentSection;
  const entry = SECTION_REGISTRY[type];
  if (!entry) return null;

  const Component = entry.component;

  const renderSection = () => {
    switch (type) {
      case SECTION_TYPES.SPARK_CUSTOMIZER:
        return (
          <Component
            value={customizerData}
            onChange={setCustomizerData}
            onContinue={goNext}
            template={template}
          />
        );

      case SECTION_TYPES.WELCOME:
        return (
          <Component
            startDate={startDate}
            onOpen={goNext}
            template={template}
            category={category}
          />
        );

      case SECTION_TYPES.LOVE_LETTER:
        return <Component letter={template.loveLetter} onClose={goNext} />;

      case SECTION_TYPES.QUESTION:
        return <Component onYes={goNext} template={template} />;

      case SECTION_TYPES.MEMORY_GALLERY:
        return (
          <Component
            memories={template.memoryGallery?.memories || []}
            onContinue={goNext}
            template={template}
          />
        );

      case SECTION_TYPES.STEP_QUESTIONS:
        return (
          <Component
            steps={template.stepQuestions?.steps || []}
            choices={choices}
            updateChoice={updateChoice}
            onDone={goNext}
            onBack={goBack}
            template={template}
          />
        );

      case SECTION_TYPES.FINAL_SUMMARY:
        return (
          <Component
            choices={choices}
            template={template}
            category={category}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {heartRain && (
        <HeartRain active={heartRain} emojis={template?.effects?.heartRain} />
      )}
      {renderSection()}
    </>
  );
}
