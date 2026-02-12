// ═══════════════════════════════════════════════════════════════
// Gift Model
// ═══════════════════════════════════════════════════════════════
//
// A Gift is an ordered list of Sections, each with a type and data.
// Templates are presets that initialize a Gift with predefined sections.
//
// Gift shape:
// {
//   id:         null | string   — assigned on save/persist
//   templateId: string          — which template preset was used
//   category:   string          — relationship category
//   customizer: string | null   — optional customizer type
//   card:       object          — display info for selector
//   theme:      object          — CSS theme class + color variables
//   effects:    object          — visual effects config
//   sections:   Section[]       — ordered UI sections
// }
//
// Section shape:
// {
//   id:   string  — unique section ID
//   type: string  — section type (maps to a renderer component)
//   data: object  — content payload for this section
// }
// ═══════════════════════════════════════════════════════════════

export const SECTION_TYPES = {
  SPARK_CUSTOMIZER: "sparkCustomizer",
  WELCOME: "welcome",
  LOVE_LETTER: "loveLetter",
  QUESTION: "question",
  MOVIE_SELECTION: "movieSelection",
  MEMORY_GALLERY: "memoryGallery",
  MEMORY_VIDEO: "memoryVideo",
  STEP_QUESTIONS: "stepQuestions",
  FINAL_SUMMARY: "finalSummary",
};

// ── ID generation ──

let _sectionIdCounter = 0;

export function generateSectionId() {
  return `sec_${Date.now()}_${++_sectionIdCounter}`;
}

// ═══════════════════════════════════════════════════════════════
// templateToGift — convert a legacy template config into a Gift
// ═══════════════════════════════════════════════════════════════

export function templateToGift(template) {
  const sections = [];

  // Spark customizer (only for templates that use it)
  if (template.customizer === "spark" && template.sparkCustomizer) {
    sections.push({
      id: generateSectionId(),
      type: SECTION_TYPES.SPARK_CUSTOMIZER,
      data: { ...template.sparkCustomizer },
    });
  }

  // Welcome
  if (template.welcome) {
    sections.push({
      id: generateSectionId(),
      type: SECTION_TYPES.WELCOME,
      data: { ...template.welcome },
    });
  }

  // Love letter (only if enabled)
  if (template.loveLetter?.enabled) {
    sections.push({
      id: generateSectionId(),
      type: SECTION_TYPES.LOVE_LETTER,
      data: { ...template.loveLetter },
    });
  }

  // Question
  if (template.question) {
    sections.push({
      id: generateSectionId(),
      type: SECTION_TYPES.QUESTION,
      data: { ...template.question },
    });
  }

  // Movie selection
  if (template.movieSelection) {
    sections.push({
      id: generateSectionId(),
      type: SECTION_TYPES.MOVIE_SELECTION,
      data: { ...template.movieSelection },
    });
  }

  // Memory gallery
  if (template.memoryGallery) {
    sections.push({
      id: generateSectionId(),
      type: SECTION_TYPES.MEMORY_GALLERY,
      data: { ...template.memoryGallery },
    });

    // If the template has a gallery but doesn't define a video section,
    // include a default Video section right after the gallery so it shows
    // up in the Builder sidebar by default.
    if (!template.memoryVideo) {
      sections.push({
        id: generateSectionId(),
        type: SECTION_TYPES.MEMORY_VIDEO,
        data: {
          title: "Видео хэсэг 🎬",
          continueButton: "Үргэлжлүүлэх 💕",
          videos: [{ src: "", caption: "", date: "" }],
        },
      });
    }
  }

  // Memory video
  if (template.memoryVideo) {
    sections.push({
      id: generateSectionId(),
      type: SECTION_TYPES.MEMORY_VIDEO,
      data: { ...template.memoryVideo },
    });
  }

  // Step questions
  if (template.stepQuestions) {
    sections.push({
      id: generateSectionId(),
      type: SECTION_TYPES.STEP_QUESTIONS,
      data: { ...template.stepQuestions },
    });
  }

  // Final summary
  if (template.finalSummary) {
    sections.push({
      id: generateSectionId(),
      type: SECTION_TYPES.FINAL_SUMMARY,
      data: { ...template.finalSummary },
    });
  }

  return {
    id: null,
    templateId: template.id,
    category: template.category,
    customizer: template.customizer || null,
    card: template.card ? { ...template.card } : {},
    theme: template.theme ? { ...template.theme } : {},
    effects: template.effects ? { ...template.effects } : {},
    sections,
  };
}

// ═══════════════════════════════════════════════════════════════
// giftToTemplate — reconstruct a template-like object from a Gift
// ═══════════════════════════════════════════════════════════════
//
// Existing components (Welcome2, Question2, etc.) read data from
// template.welcome, template.question, etc.  This function lets
// them work unchanged when driven by a Gift.

export function giftToTemplate(gift) {
  const template = {
    id: gift.templateId,
    category: gift.category,
    customizer: gift.customizer,
    card: gift.card ? { ...gift.card } : {},
    theme: gift.theme ? { ...gift.theme } : {},
    effects: gift.effects ? { ...gift.effects } : {},
  };

  for (const section of gift.sections) {
    template[section.type] = { ...section.data };
  }

  return template;
}

// ═══════════════════════════════════════════════════════════════
// createEmptyGift — blank Gift for the future Builder
// ═══════════════════════════════════════════════════════════════

export function createEmptyGift() {
  return {
    id: null,
    templateId: null,
    category: null,
    customizer: null,
    card: {},
    theme: {},
    effects: {},
    sections: [],
  };
}
