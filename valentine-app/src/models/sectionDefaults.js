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
  variantsEnabled: true,
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

  [SECTION_TYPES.MOVIE_SELECTION]: {
    title: "Кино сонголт 🎬",
    subtitle: "Дуртай киногоо сонгоод ticketing нээгээрэй 💞",
    hint: "Poster дээр дарахад шинэ tab нээгдэнэ",
    continueButton: "Үргэлжлүүлэх 💕",
    spinSeconds: 20,
    movies: [
      {
        title: "Avatar",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001809",
        linkUrl: "https://ticketing.urgoo.mn/movie/HO00001809",
      },
      {
        title: "Avatar fire and ash",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001738",
        linkUrl: "https://ticketing.urgoo.mn/movie/HO00001738",
      },
      {
        title: "Zootopia 2",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001694",
        linkUrl: "https://ticketing.urgoo.mn/movie/HO00001694",
      },
      {
        title: "GOAT",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001744",
        linkUrl: "https://ticketing.urgoo.mn/movie/HO00001744",
      },
      {
        title: "Wuthering Heights IMAX",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001827",
        linkUrl: "https://ticketing.urgoo.mn/movie/HO00001827",
      },
      {
        title: "Whistle",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001828",
        linkUrl: "https://ticketing.urgoo.mn/movie/HO00001828",
      },
      {
        title: "Хайрын Дурсамж",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001837",
        linkUrl: "https://ticketing.urgoo.mn/movie/HO00001837",
      },
      {
        title: "Wuthering Heights",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001780",
        linkUrl: "",
      },
      {
        title: "Аавын Охин",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001838",
        linkUrl: "",
      },
      {
        title: "Greenland 2: Migration",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001802",
        linkUrl: "",
      },
      {
        title: "Задлаагүй Захиа",
        posterUrl:
          "https://booking.urgoo.mn/CDN/media/entity/get/FilmPosterGraphic/HO00001826",
        linkUrl: "",
      },
    ],
  },

  [SECTION_TYPES.MEMORY_GALLERY]: {
    headerIcon: "💝",
    headerTitle: "Бидний дурсамжууд",
    headerIconAnimation: "bearLove 1.5s ease infinite",
    placeholderHint: "Зургаа энд нэмнэ үү",
    footerText: "Бүх дурсамж үнэ цэнэтэй... 💕",
    continueButton: "Үргэлжлүүлэх 👩‍❤️‍💋‍👨",
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
      { key: "movie", emoji: "🎬", label: "Кино" },
    ],
    quotes: ["Чамтай хамт байх мөч бүр онцгой 💕", "Чи бол миний бүх зүйл 💝"],
  },

  [SECTION_TYPES.MEMORY_VIDEO]: {
    title: "Видео хэсэг 🎬",
    continueButton: "Үргэлжлүүлэх 💕",
    videos: [
      {
        src: "",
        caption: "Анхны бичлэг 🎬",
        date: "Дурсамж 1",
      },
    ],
  },

  [SECTION_TYPES.SPECIAL_QUESTIONS]: {
    questions: [
      {
        text: "Би чамд хайртай болоод хэдэн жил болсон бэ?",
        options: [
          { emoji: "1️⃣", name: "1 жил" },
          { emoji: "2️⃣", name: "2 жил" },
          { emoji: "3️⃣", name: "3 жил" },
          { emoji: "4️⃣", name: "4 жил" },
        ],
        correctIndex: 1,
        explanation: "Тэр өдрийг үнэхээр тод санаж байна 💕",
      },
      {
        text: "Би чамайг өдөрт хэдэн удаа боддог гэж бодож байна?",
        options: [
          { emoji: "1️⃣", name: "1 удаа" },
          { emoji: "🔟", name: "10 удаа" },
          { emoji: "💯", name: "100 удаа" },
          { emoji: "🔢", name: "1000 удаа" },
        ],
        correctIndex: 0,
        explanation:
          "Өглөө сэрэхдээ нэг бодоод, унтах хүртлээ бодсоор л байдаг 💭❤️",
      },
      {
        text: "Яг одоо би чамд юу гэж хэлмээр байгаа гэж бодож байна?",
        options: [
          { emoji: "❤️", name: "Хайртай шүү" },
          { emoji: "😍", name: "Чи үнэхээр үзэсгэлэнтэй" },
          { emoji: "🤗", name: "Хурдан уулзмаар байна" },
          { emoji: "💖", name: "Бүгд" },
        ],
        correctIndex: 3,
        explanation: "Ойлгомжтой биздээ 😊💕",
      },
      {
        text: "Чиний юу хамгийн их таалагддаг гэж бодож байна?",
        allWrong: true,
        options: [
          { emoji: "😊", name: "Инээмсэглэл" },
          { emoji: "💎", name: "Зан чанар" },
          { emoji: "👀", name: "Нүд" },
          { emoji: "💄", name: "Чиний гоо үзэсгэлэн" },
        ],
        revealText: "Бүх зүйлд чинь дуртай 💖",
      },
    ],
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
