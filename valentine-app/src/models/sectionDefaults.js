// ═══════════════════════════════════════════════════════════════
// Section Defaults
// ═══════════════════════════════════════════════════════════════
//
// Default data for each section type, used when adding new sections
// in the Builder. Each default is self-contained so the component
// can render a meaningful preview without crashing.
// ═══════════════════════════════════════════════════════════════

import { SECTION_TYPES, generateSectionId } from "./gift";

const DEFAULT_TIMER = {
  title: "Бид хамт байсан хугацаа",
  labels: { days: "Өдөр", hours: "Цаг", minutes: "Минут", seconds: "Секунд" },
};

const DEFAULT_NO_BUTTON = {
  defaultText: "Үгүй 💔",
  messages: [
    "Үгүй гэж болохгүй 🥺",
    "Дахиад бодоод үз 💭",
    "Зүрх минь эвдэрч байна 💔",
    "Яг үнэндээ? 😢",
    "Чи дуртайл байгаа биздээ 🤔",
  ],
};

const DEFAULT_YES_BUTTON = { text: "Тийм", emoji: "❤️" };

// ── Per-type defaults ──

const SECTION_DEFAULTS = {
  [SECTION_TYPES.WELCOME]: {
    character: { type: "bear", envelopeEmojis: { letter: "💌", heart: "💝" } },
    title: "Happy Valentine's Day 💕",
    subtitle: "Хамгийн хайртай хүндээ зориулсан\nтусгай урилга ❤️",
    timer: { ...DEFAULT_TIMER },
    buttonText: "Урилга нээх 💌",
  },

  [SECTION_TYPES.LOVE_LETTER]: {
    enabled: true,
    envelope: { emoji: "💌", text: "Нээж үзээрэй...", sparkleEmoji: "✨" },
    decorations: { top: "💕", bottom: "🌹", divider: "♥" },
    heartTrail: ["❤️", "💕", "💖", "💗", "💓"],
    closeButtonText: "Уншлаа 💕",
    title: "Миний зүрхний захидал 💌",
    content: "Энд хайрын захидлаа бичнэ үү...",
  },

  [SECTION_TYPES.QUESTION]: {
    character: null,
    text: "Чи намайг хайрладаг юу? 🥺💕",
    yesButton: { ...DEFAULT_YES_BUTTON },
    noButton: { ...DEFAULT_NO_BUTTON },
  },

  [SECTION_TYPES.MEMORY_GALLERY]: {
    headerIcon: "💝",
    headerTitle: "Бидний дурсамжууд",
    headerIconAnimation: "bearLove 1.5s ease infinite",
    placeholderHint: "Зургаа энд нэмнэ үү",
    footerText: "Бүх дурсамж үнэ цэнэтэй... 💕",
    continueButton: "Үргэлжлүүлэх 💑",
    memories: [
      {
        type: "image",
        src: "",
        placeholder: "📸",
        date: "Дурсамж 1",
        caption: "Анхны мөч ✨",
      },
      {
        type: "image",
        src: "",
        placeholder: "💕",
        date: "Дурсамж 2",
        caption: "Сайхан цаг 💖",
      },
    ],
  },

  [SECTION_TYPES.STEP_QUESTIONS]: {
    multiSelectHint: "✨ Олон хариулт сонгох боломжтой",
    selectedCountSuffix: "сонгогдсон ✨",
    backButton: "← Буцах",
    nextButton: "Дараагийх →",
    doneButton: "Баталгаажуулах 💕",
    steps: [
      {
        emoji: "📍",
        title: "Хаана уулзах вэ?",
        key: "place",
        type: "grid",
        multiSelect: false,
        options: [
          { emoji: "☕", name: "Кафе", desc: "Тайван яриа", value: "Кафе" },
          { emoji: "🌸", name: "Парк", desc: "Алхаж ярилцъя", value: "Парк" },
          {
            emoji: "🎬",
            name: "Кино",
            desc: "Хамтдаа кино",
            value: "Кино",
          },
        ],
      },
      {
        emoji: "⏰",
        title: "Хэдэн цагт?",
        key: "time",
        type: "time",
        multiSelect: false,
        options: [
          { label: "🌅 17:00", value: "17:00" },
          { label: "🌙 19:00", value: "19:00" },
        ],
      },
    ],
  },

  [SECTION_TYPES.FINAL_SUMMARY]: {
    headerEmoji: "💝",
    title: "Бүх зүйл бэлэн! 🎉",
    subtitle: "Valentine's Day",
    dateRow: { emoji: "📅", label: "Огноо", value: "2026.02.14 ❤️" },
    meter: { label: "Догдлолын түвшин", text: "♾️ Хязгааргүй" },
    signature: "Forever Together",
    footer: "Valentine's Day 2026 • Made with ❤️",
    summaryFields: [
      { key: "place", emoji: "📍", label: "Уулзах газар" },
      { key: "time", emoji: "⏰", label: "Цаг" },
    ],
    quotes: ["Чамтай хамт байх мөч бүр онцгой 💕", "Чи бол миний бүх зүйл 💝"],
  },

  [SECTION_TYPES.SPARK_CUSTOMIZER]: {
    stickers: ["💘", "🌹", "🎀", "🍫", "💌", "✨"],
    badge: "2.14",
    title: "Happy Valentine's Day",
    subtitle: "Customize your Valentine 💖",
    quizTitle: "How well do you know me?",
    defaultQuestions: [
      { q: "How well do you know me?", a1: "Movies 🎬", a2: "Partying 💃" },
    ],
    phoneStickers: ["💞", "🌸", "✨", "💗"],
    phonePlaceholder: {
      heart: "💖",
      text: "Happy Valentine's Day",
      sub: "Will you be mine? 💌",
    },
    phoneCTA: { title: "Be My Valentine? 💘", sub: "2.14 💌" },
    musicBar: { icon: "🎵", title: "Your Song", sub: "YouTube" },
    continueButton: "Continue 💌",
    note: "",
    revealFace: "🙂",
    revealPill: "HOVER TO REVEAL",
    labels: {
      youtubeLink: "YouTube link",
      youtubeHintOk: "OK",
      youtubeHintTip: "Paste a YouTube link",
      coverLabel: "Cover image",
      coverHint: "Cover hint",
    },
  },
};

/**
 * Get a deep copy of the default data for a section type.
 */
export function getDefaultSectionData(type) {
  return JSON.parse(JSON.stringify(SECTION_DEFAULTS[type] || {}));
}

/**
 * Create a new section with a unique ID and default data.
 */
export function createDefaultSection(type) {
  return {
    id: generateSectionId(),
    type,
    data: getDefaultSectionData(type),
  };
}
