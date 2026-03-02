/*
  Template configurations for Mendchilgee.site — Mongolian greeting card platform.
  Organized by HOLIDAY CATEGORY.

  Structure per template:
  ─ card:            Template selector display info
  ─ theme:           CSS theme class and color variables
  ─ customizer:      Optional customizer type
  ─ welcome:         Welcome page (character, title, timer, button)
  ─ loveLetter:      Message / Greeting letter overlay
  ─ memoryGallery:   Photo gallery section
  ─ stepQuestions:    Step-by-step interactive questions
  ─ finalSummary:    Final summary / closing page
  ─ effects:         Visual effects (emojis, confetti, flowers, etc.)
*/

// ═══════════════════════════════════════════════════════════════
// SHARED DEFAULTS
// ═══════════════════════════════════════════════════════════════

const DEFAULT_TIMER = {
  title: "Баяр болоход үлдсэн хугацаа",
  labels: { days: "Өдөр", hours: "Цаг", minutes: "Минут", seconds: "Секунд" },
};

const DEFAULT_NO_BUTTON = {
  defaultText: "Үгүй 😢",
  messages: [
    "Үгүй гэж болохгүй 🥺",
    "Дахиад бодоод үз 💭",
    "Зөвхөн Тийм л байна 😊",
    "Яг үнэндээ? 😢",
    "Ахиад нэг удаа бодох уу? 🤔",
    "Тийм гэж хэл дээ 😤",
    "Плиииз 🥹",
    "Сүүлийн боломж чинь шүү 🤡",
  ],
};

const DEFAULT_YES_BUTTON = { text: "Тийм", emoji: "❤️" };

const DEFAULT_STEP_UI = {
  multiSelectHint: "✨ Олон хариулт сонгох боломжтой",
  selectedCountSuffix: "сонгогдсон ✨",
  backButton: "← Буцах",
  nextButton: "Дараагийх →",
  doneButton: "Баталгаажуулах 🎉",
};

const DEFAULT_LETTER_UI = {
  envelope: { emoji: "💌", text: "Нээж үзээрэй...", sparkleEmoji: "✨" },
  decorations: { top: "🌸", bottom: "🌹", divider: "♥" },
  heartTrail: ["🌸", "💐", "🌷", "🌺", "✨"],
  closeButtonText: "Уншлаа 💕",
};

const DEFAULT_GALLERY_UI = {
  headerIcon: "📸",
  headerTitle: "Зургийн цомог",
  headerIconAnimation: "bearLove 1.5s ease infinite",
  placeholderHint: "Зургаа энд нэмнэ үү",
  footerText: "Дурсамж бүр үнэ цэнэтэй... ✨",
  continueButton: "Үргэлжлүүлэх →",
};

const DEFAULT_FINAL_UI = {
  headerEmoji: "🎉",
  title: "Баярын мэндчилгээ! 🎊",
  subtitle: "Чамд зориулсан онцгой мэндчилгээ",
  dateRow: { emoji: "📅", label: "Баяр", value: "" },
  meter: { label: "Сэтгэлийн хүч", text: "♾️ Хязгааргүй" },
  signature: "Хайр хүндэтгэлтэйгээр",
  footer: "Мэндчилгээ © 2026 • mendchilgee.site",
};

const DEFAULT_EFFECTS = {
  floatingHearts: ["🌸", "✨", "🎉", "💐", "🌷", "🌹", "🎊", "💫", "🌺", "⭐"],
  heartRain: ["🌸", "🌷", "🌹", "💐", "🌺", "✨", "🎊", "⭐", "💫"],
  confettiColors: [
    "#ff6b9d",
    "#ff4081",
    "#c471ed",
    "#7c4dff",
    "#ff9a9e",
    "#ffd1dc",
    "#fff",
    "#f8bbd0",
  ],
  clickSparkles: ["✨", "🌸", "💐", "⭐"],
  flowers: [
    { emoji: "🌸", size: 38 },
    { emoji: "🌺", size: 34 },
    { emoji: "🌹", size: 40 },
    { emoji: "🌷", size: 36 },
    { emoji: "💐", size: 42 },
    { emoji: "🌻", size: 35 },
    { emoji: "🌼", size: 32 },
    { emoji: "🏵️", size: 37 },
    { emoji: "🌸", size: 30 },
    { emoji: "🌺", size: 36 },
    { emoji: "🌹", size: 33 },
    { emoji: "🌷", size: 38 },
    { emoji: "💮", size: 28 },
    { emoji: "🌸", size: 34 },
  ],
  leafEmoji: "🍃",
  stickers: ["🌸", "🌹", "🌷", "💐", "🌺", "✨", "🎊", "🎉", "⭐", "💫"],
};

const STICKERS_FLOWERS = [
  "🌸", "🌹", "🌷", "💐", "🌺", "🌻", "🌼", "🏵️", "💮", "🌿",
];
const STICKERS_FESTIVE = [
  "🎉", "🎊", "🎈", "🎁", "🎀", "✨", "⭐", "💫", "🎪", "🪅",
];
const STICKERS_MILITARY = [
  "🎖️", "⭐", "🏅", "🛡️", "💪", "🇲🇳", "✨", "🎯", "🦅", "🏆",
];
const STICKERS_LOVE = [
  "💕", "💖", "💗", "💓", "💞", "💘", "❤️‍🔥", "🥰", "😘", "💋",
];

// ─── Welcome character presets ───
const WELCOME_FLOWER = {
  type: "emoji",
  wrapClass: "welcome-char butterfly-char",
  bodyEmoji: "🌸",
  bodyClass: "butterfly-body",
  accentContainerClass: "butterfly-sparkles",
  accentItemClass: "bf-sparkle",
  accents: ["💐", "✨", "🌷", "🌹"],
};
const WELCOME_BEAR = {
  type: "bear",
  envelopeEmojis: { letter: "💌", heart: "💝" },
};
const WELCOME_STAR = {
  type: "emoji",
  wrapClass: "welcome-char moon-char",
  bodyEmoji: "⭐",
  bodyClass: "moon-body",
  accentContainerClass: "moon-stars",
  accentItemClass: "moon-star",
  accents: ["🎖️", "✨", "⭐", "💫", "🏅"],
};
const WELCOME_GIFT = {
  type: "emoji",
  wrapClass: "welcome-char cat-char",
  bodyEmoji: "🎁",
  bodyClass: "cat-body",
  accentContainerClass: "cat-hearts",
  accentItemClass: "cat-heart",
  accents: ["🎉", "🎊", "✨"],
};
const WELCOME_CAKE = {
  type: "emoji",
  wrapClass: "welcome-char fire-char",
  bodyEmoji: "🎂",
  bodyClass: "fire-body",
  accentContainerClass: "fire-sparks",
  accentItemClass: "fire-spark",
  accents: ["🎈", "🎉", "✨"],
};
const WELCOME_HEART = {
  type: "emoji",
  wrapClass: "welcome-char butterfly-char",
  bodyEmoji: "❤️",
  bodyClass: "butterfly-body",
  accentContainerClass: "butterfly-sparkles",
  accentItemClass: "bf-sparkle",
  accents: ["💕", "✨", "💖", "💗"],
};

// ═══════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════

export const CATEGORIES = [
  {
    id: "march8",
    emoji: "🌷",
    name: "3-р сарын 8",
    desc: "Олон улсын эмэгтэйчүүдийн баярт зориулсан",
    vibe: "Хүндэтгэл, хайр, талархал",
    gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    bgEmojis: ["🌷", "🌸", "💐", "✨"],
    selectedText: "✓ Сонгогдсон",
    selectText: "Сонгох →",
  },
  {
    id: "soldiers-day",
    emoji: "🎖️",
    name: "Цэргийн баяр",
    desc: "Монголын цэргийн баярт зориулсан мэндчилгээ",
    vibe: "Эрэлхэг, хүндэтгэл, баатарлаг",
    gradient: "linear-gradient(135deg, #2c3e50, #3498db)",
    bgEmojis: ["🎖️", "⭐", "🛡️", "🦅"],
    selectedText: "✓ Сонгогдсон",
    selectText: "Сонгох →",
  },
  {
    id: "birthday",
    emoji: "🎂",
    name: "Төрсөн өдөр",
    desc: "Хайртай хүндээ төрсөн өдрийн мэндчилгээ",
    vibe: "Баяр хөөр, хөгжилтэй, сэтгэл хөдлөм",
    gradient: "linear-gradient(135deg, #f093fb, #c471ed)",
    bgEmojis: ["🎂", "🎈", "🎁", "🎉"],
    selectedText: "✓ Сонгогдсон",
    selectText: "Сонгох →",
  },
  {
    id: "valentine",
    emoji: "💕",
    name: "Valentine's Day",
    desc: "Хайрын баяраар хайртай хүндээ",
    vibe: "Хайр, сэтгэл хөдлөм, романтик",
    gradient: "linear-gradient(135deg, #ff6b9d, #ff4081)",
    bgEmojis: ["💕", "💘", "❤️", "🌹"],
    selectedText: "✓ Сонгогдсон",
    selectText: "Сонгох →",
  },
  {
    id: "general",
    emoji: "🎊",
    name: "Ерөнхий мэндчилгээ",
    desc: "Ямар ч шалтгаанаар — шинэ жил, баяр ёслол, талархал",
    vibe: "Баярлалаа, хүндэтгэл, талархал",
    gradient: "linear-gradient(135deg, #f6d365, #fda085)",
    bgEmojis: ["🎊", "🎉", "✨", "🎈"],
    selectedText: "✓ Сонгогдсон",
    selectText: "Сонгох →",
  },
];

// ═══════════════════════════════════════════════════════════════
// MARCH 8 / Эмэгтэйчүүдийн баяр TEMPLATES
// ═══════════════════════════════════════════════════════════════

const MARCH8_TEMPLATES = [
  // ── 1. Ээж, эгч, ээмээдээ ──
  {
    id: "march8-family",
    category: "march8",
    customizer: null,
    card: {
      name: "Ээж, эгч, ээмээдээ 👩‍👧‍👦",
      desc: "Хайрт ээж, эгч, эмээдээ зориулсан дулаахан мэндчилгээ",
      preview: "🌷👩‍👧‍👦",
      tags: ["💝 Гэр бүл", "🌷 Дулаахан"],
    },
    theme: {
      className: "theme-crush-shy",
      colors: {
        "--t-primary": "#e91e63",
        "--t-secondary": "#f06292",
        "--t-accent": "#f8bbd0",
        "--t-accent2": "#ff80ab",
        "--t-soft": "#fce4ec",
        "--t-light": "#fff0f5",
        "--t-bg": "#1a0a10",
        "--t-bg2": "#2a1020",
        "--t-glass": "rgba(233, 30, 99, 0.05)",
        "--t-glass-border": "rgba(233, 30, 99, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_BEAR },
      title: "Хайрт ээж, эгч, ээмээдээ 🌷",
      subtitle: "Гэр бүлийн хамгийн хайртай эмэгтэйчүүддээ зориулав 💝",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      decorations: { top: "💝", bottom: "🌺", divider: "♥" },
      title: "Хайрт минь... 💌",
      content:
        "Та бол миний амьдралын хамгийн чухал хүн.\nТаны хайр, халамж, дулаахан инээмсэглэл миний хүч чадал.\nЭнэ өдрөөр тандаа баярын мэнд хүргье! 🌷",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerTitle: "Хамтын дурсамжууд 💝",
      continueButton: "Үргэлжлүүлэх 🌸",
      memories: [
        { type: "image", src: "", date: "Хамтын мөч", caption: "Хамтдаа байхад л жаргалтай 💝" },
        { type: "image", src: "", date: "Инээмсэглэл", caption: "Таны инээмсэглэл миний наран 🌷" },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "🎁",
          title: "Юу бэлэглэх вэ?",
          key: "gift",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "💐", name: "Цэцэг", desc: "Үзэсгэлэнтэй баглаа", value: "Цэцэг" },
            { emoji: "🧣", name: "Ороолт", desc: "Дулаахан бэлэг", value: "Ороолт" },
            { emoji: "💍", name: "Үнэт эдлэл", desc: "Онцгой бэлэг", value: "Үнэт эдлэл" },
            { emoji: "🍰", name: "Бялуу", desc: "Амтат баяр", value: "Бялуу" },
            { emoji: "💄", name: "Гоо сайхан", desc: "Гоёлын хэрэгсэл", value: "Гоо сайхан" },
            { emoji: "💝", name: "Зүрхний бэлэг", desc: "Сэтгэлийн бэлэг", value: "Зүрхний бэлэг" },
          ],
        },
        {
          emoji: "☕",
          title: "Хаана хамт цагийг өнгөрүүлэх вэ?",
          key: "place",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "🏠", name: "Гэртээ", desc: "Дулаахан гэр бүлийн уур амьсгалд", value: "Гэртээ" },
            { emoji: "🍽️", name: "Ресторан", desc: "Гоёмсог оройн хоол", value: "Ресторан" },
            { emoji: "☕", name: "Кафе", desc: "Аяга цайны хамт", value: "Кафе" },
            { emoji: "🌸", name: "Парк", desc: "Хаврын агаарт", value: "Парк" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      title: "3-р сарын 8-ны мэнд! 🌷",
      subtitle: "Хайрт ээж, эгч, эмээдээ баярын мэнд хүргэе!",
      dateRow: { emoji: "🌷", label: "Баяр", value: "3-р сарын 8 💐" },
      summaryFields: [
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
        { key: "place", emoji: "📍", label: "Газар" },
      ],
      quotes: [
        "Ээж бол дэлхийн хамгийн үнэтэй хүн 💝",
        "Ээжийн хайр бол хязгааргүй наран 🌷",
        "Та бол миний амьдралын хамгийн гоё цэцэг 🌸",
        "Эгч минь, та бол миний жишээ ✨",
      ],
      footer: "3-р сарын 8 © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🌷", "🌸", "💐", "🌹", "✨", "🌺", "💮", "💝", "🏵️", "💕"],
      heartRain: ["🌷", "🌸", "💐", "🌹", "✨", "🌺", "💮", "💝", "🏵️"],
      confettiColors: ["#e91e63", "#f06292", "#f8bbd0", "#ff80ab", "#fce4ec", "#fff0f5", "#fff", "#c2185b"],
      clickSparkles: ["🌷", "✨", "🌸", "💐"],
      stickers: STICKERS_FLOWERS,
    },
  },

  // ── 2. Хамт олондоо ──
  {
    id: "march8-colleagues",
    category: "march8",
    customizer: null,
    card: {
      name: "Хамт олондоо 👩‍💼✨",
      desc: "Ангийн охид, хамтран ажиллагсад, найз нөхөддөө",
      preview: "🌸👭",
      tags: ["👭 Хамт олон", "🎀 Энержитэй"],
    },
    theme: {
      className: "theme-candy",
      colors: {
        "--t-primary": "#d81b60",
        "--t-secondary": "#f06292",
        "--t-accent": "#f48fb1",
        "--t-accent2": "#ff80ab",
        "--t-soft": "#fce4ec",
        "--t-light": "#fff0f5",
        "--t-bg": "#0e0012",
        "--t-bg2": "#1a0520",
        "--t-glass": "rgba(216, 27, 96, 0.05)",
        "--t-glass-border": "rgba(216, 27, 96, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_GIFT },
      title: "Хамт олондоо баярын мэнд! 🌸",
      subtitle: "Хамгийн гоё бүсгүйчүүддээ зориулав 🎀",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх ✨",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      title: "Хамт олондоо... 💌",
      content:
        "Та бүхэнтэй хамт байх бүр миний өдөр тод болдог.\nТа нарын инээмсэглэл, дэмжлэг бол хамгийн том хүч.\n3-р сарын 8-ны баяраар та бүхэнд мэнд хүргэе! 🌸",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerTitle: "Хамтын мөчүүд 📸",
      continueButton: "Үргэлжлүүлэх 🎀",
      memories: [
        { type: "image", src: "", date: "Хамтын мөч", caption: "Хөгжилтэй цаг хугацаа 🌸" },
        { type: "image", src: "", date: "Баярын мөч", caption: "Хамтдаа баярлацгаая ✨" },
      ],
    },
    stepQuestions: null,
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      title: "Хамт олондоо мэнд! 🌸",
      subtitle: "3-р сарын 8-ны баяраар",
      dateRow: { emoji: "🌸", label: "Баяр", value: "3-р сарын 8" },
      summaryFields: [],
      quotes: [
        "Хамт олон бол хоёр дахь гэр бүл 🌸",
        "Та бүхэнтэй хамт ажиллах бол азын хэрэг ✨",
        "Гоё бүсгүйчүүддээ баярын мэнд! 🎀",
        "Хамтдаа бид хамгийн хүчтэй 💪🌷",
      ],
      footer: "3-р сарын 8 © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🌸", "🎀", "✨", "💐", "💕", "🌷", "🌹", "🌺", "💮", "⭐"],
      heartRain: ["🌸", "🎀", "✨", "💐", "💕", "🌷", "🌺", "💮", "⭐"],
      confettiColors: ["#d81b60", "#f06292", "#f48fb1", "#ff80ab", "#fce4ec", "#fff0f5", "#fff", "#ad1457"],
      clickSparkles: ["🌸", "✨", "🎀", "💐"],
      stickers: STICKERS_FLOWERS,
    },
  },

  // ── 3. Бусад ──
  {
    id: "march8-others",
    category: "march8",
    customizer: null,
    card: {
      name: "Бусад 🌹💫",
      desc: "Багш, талархдаг хүн, харж явдаг охиндоо зориулсан",
      preview: "🌹✨",
      tags: ["✨ Талархал", "🌹 Онцгой"],
    },
    theme: {
      className: "theme-new-sweet",
      colors: {
        "--t-primary": "#ec407a",
        "--t-secondary": "#f48fb1",
        "--t-accent": "#fce4ec",
        "--t-accent2": "#ff80ab",
        "--t-soft": "#fff0f5",
        "--t-light": "#fff5f8",
        "--t-bg": "#1a0510",
        "--t-bg2": "#250818",
        "--t-glass": "rgba(236, 64, 122, 0.05)",
        "--t-glass-border": "rgba(236, 64, 122, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_FLOWER },
      title: "Танд зориулсан мэндчилгээ 🌹",
      subtitle: "Онцгой хүндээ зүрхнээсээ хүргэж байна ✨",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      decorations: { top: "✨", bottom: "🌹", divider: "♥" },
      title: "Танд хэлмээр зүйл бий... 💌",
      content:
        "Таны байгаа нь миний хувьд онцгой утга учиртай.\nТаны сайхан сэтгэл, хайр халамжид үргэлж талархдаг.\n3-р сарын 8-ны баяраар танд мэнд хүргэе! 🌹",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerTitle: "Дурсамжууд 📸",
      continueButton: "Үргэлжлүүлэх 🌹",
      memories: [
        { type: "image", src: "", date: "Онцгой мөч", caption: "Хамтын гоо мөч ✨" },
        { type: "image", src: "", date: "Инээмсэглэл", caption: "Инээмсэглэл бүхэн үнэтэй 🌹" },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "🎁",
          title: "Юу бэлэглэх вэ?",
          key: "gift",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "💐", name: "Цэцэг", desc: "Сайхан баглаа цэцэг", value: "Цэцэг" },
            { emoji: "🍫", name: "Шоколад", desc: "Амтат бэлэг", value: "Шоколад" },
            { emoji: "📖", name: "Ном", desc: "Мэдлэгийн бэлэг", value: "Ном" },
            { emoji: "🎀", name: "Гарын бэлэг", desc: "Сэтгэлийн бэлэг", value: "Гарын бэлэг" },
            { emoji: "☕", name: "Цай/Кофе", desc: "Дулаахан мөч хамтдаа", value: "Цай/Кофе" },
            { emoji: "💝", name: "Сюрприз", desc: "Тэсэн ядсан бэлэг", value: "Сюрприз" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      title: "Баярын мэнд хүргэе! 🌹",
      subtitle: "3-р сарын 8-ны баяраар танд зориулав",
      dateRow: { emoji: "🌹", label: "Баяр", value: "3-р сарын 8" },
      summaryFields: [
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "Таны инээмсэглэл дэлхийг гэрэлтүүлдэг ✨",
        "Эмэгтэй хүн бий газар цэцэг дэлгэрнэ 🌸",
        "Та бол онцгой хүн, үүнийгээ мартуузай 🌹",
        "Талархлын мэдрэмж зүрхнээс 💫",
      ],
      footer: "3-р сарын 8 © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🌹", "✨", "🌸", "💐", "💕", "🌷", "🌺", "💮", "💫", "🏵️"],
      heartRain: ["🌹", "✨", "🌸", "💐", "💕", "🌷", "🌺", "💮", "💫"],
      confettiColors: ["#ec407a", "#f48fb1", "#fce4ec", "#ff80ab", "#fff0f5", "#fff5f8", "#fff", "#c2185b"],
      clickSparkles: ["🌹", "✨", "🌸", "💫"],
      stickers: STICKERS_FLOWERS,
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// SOLDIERS' DAY / Цэргийн баяр TEMPLATES
// ═══════════════════════════════════════════════════════════════

const SOLDIERS_DAY_TEMPLATES = [
  {
    id: "soldiers-honor",
    category: "soldiers-day",
    customizer: null,
    card: {
      name: "Эрэлхэг баатарт 🎖️",
      desc: "Хүндэтгэл, бахархал, талархал",
      preview: "🎖️⭐",
      tags: ["🛡️ Хүндэтгэл", "⭐ Гоёмсог"],
    },
    theme: {
      className: "theme-starry",
      colors: {
        "--t-primary": "#1565c0",
        "--t-secondary": "#42a5f5",
        "--t-accent": "#90caf9",
        "--t-accent2": "#64b5f6",
        "--t-soft": "#bbdefb",
        "--t-light": "#e3f2fd",
        "--t-bg": "#0a0e1a",
        "--t-bg2": "#0d1525",
        "--t-glass": "rgba(21, 101, 192, 0.05)",
        "--t-glass-border": "rgba(21, 101, 192, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_STAR },
      title: "Цэргийн баярын мэнд! 🎖️",
      subtitle: "Эрэлхэг зоригт баатарт зориулав ⭐",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх 🎖️",
    },
    loveLetter: {
      enabled: true,
      envelope: { emoji: "🎖️", text: "Нээж үзээрэй...", sparkleEmoji: "⭐" },
      decorations: { top: "⭐", bottom: "🎖️", divider: "★" },
      heartTrail: ["⭐", "🎖️", "✨", "💫", "🏅"],
      closeButtonText: "Уншлаа ⭐",
      title: "Хүндэтгэлтэйгээр... 🎖️",
      content:
        "Эх орноо хамгаалсан эрэлхэг зоригт таньд баярлалаа.\nТаны зориг, тэвчээр бол бидний бахархал.\nЦэргийн баяраар мэндчилгээ дэвшүүлье! 🎖️",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerIcon: "⭐",
      headerTitle: "Алдар гавьяа ⭐",
      continueButton: "Үргэлжлүүлэх 🎖️",
      memories: [
        { type: "image", src: "", date: "Эрэлхэг мөч", caption: "Баатарлаг мөч... 🎖️" },
        { type: "image", src: "", date: "Бахархал", caption: "Бахархлын мөч ⭐" },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "🎁",
          title: "Юугаар баярлуулах вэ?",
          key: "gift",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "🎖️", name: "Медаль", desc: "Хүндэтгэлийн тэмдэг", value: "Медаль" },
            { emoji: "⌚", name: "Цаг", desc: "Цагийн бэлэг", value: "Цаг" },
            { emoji: "👔", name: "Хувцас", desc: "Гоёлын бэлэг", value: "Хувцас" },
            { emoji: "📖", name: "Ном", desc: "Мэдлэгийн бэлэг", value: "Ном" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🎖️",
      title: "Цэргийн баярын мэнд! ⭐",
      subtitle: "Эрэлхэг зоригт баатарт",
      dateRow: { emoji: "🎖️", label: "Баяр", value: "Цэргийн баяр" },
      summaryFields: [
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "Эрэлхэг зоригтнуудын баяр! 🎖️",
        "Эх орноо хамгаалсан баатарт баярлалаа ⭐",
        "Таны зориг бидний бахархал 💪",
      ],
      footer: "Цэргийн баяр © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🎖️", "⭐", "🏅", "✨", "🛡️", "💫", "🇲🇳", "💪", "🦅", "🏆"],
      heartRain: ["⭐", "🎖️", "🏅", "✨", "💫", "🛡️", "🇲🇳", "💪", "🦅"],
      confettiColors: ["#1565c0", "#42a5f5", "#90caf9", "#64b5f6", "#bbdefb", "#e3f2fd", "#fff", "#0d47a1"],
      clickSparkles: ["⭐", "🎖️", "✨", "🏅"],
      stickers: STICKERS_MILITARY,
    },
  },
  {
    id: "soldiers-strong",
    category: "soldiers-day",
    customizer: null,
    card: {
      name: "Эх орны хамгаалагч 🛡️",
      desc: "Хүчтэй, эрэлхэг загвар",
      preview: "🛡️💪",
      tags: ["💪 Хүчтэй", "🇲🇳 Монгол"],
    },
    theme: {
      className: "theme-ld-moonlight",
      colors: {
        "--t-primary": "#263238",
        "--t-secondary": "#37474f",
        "--t-accent": "#546e7a",
        "--t-accent2": "#78909c",
        "--t-soft": "#b0bec5",
        "--t-light": "#eceff1",
        "--t-bg": "#0a0d10",
        "--t-bg2": "#121820",
        "--t-glass": "rgba(38, 50, 56, 0.05)",
        "--t-glass-border": "rgba(38, 50, 56, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_STAR },
      title: "Эх орны хамгаалагчид 🛡️",
      subtitle: "Хүндэтгэл, бахархал, талархал 🇲🇳",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх 🛡️",
    },
    loveLetter: {
      enabled: true,
      envelope: { emoji: "🛡️", text: "Нээж үзээрэй...", sparkleEmoji: "⭐" },
      decorations: { top: "🛡️", bottom: "⭐", divider: "★" },
      heartTrail: ["🛡️", "⭐", "🎖️", "💫", "✨"],
      closeButtonText: "Уншлаа 🛡️",
      title: "Эрэлхэг баатарт 🛡️",
      content:
        "Та бол эх орны найдвар, ард түмний бахархал.\nТаны зориг, тэвчээр бол жинхэнэ баатарлаг зан чанар.\nЦэргийн баярын мэнд хүргэе! 🇲🇳",
    },
    question: null,
    memoryGallery: null,
    stepQuestions: null,
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🛡️",
      title: "Цэргийн баярын мэнд! 🇲🇳",
      subtitle: "Эрэлхэг баатарт хүндэтгэлтэйгээр",
      dateRow: { emoji: "🛡️", label: "Баяр", value: "Цэргийн баяр 🇲🇳" },
      summaryFields: [],
      quotes: [
        "Монгол эрчүүд бол жинхэнэ баатар 💪",
        "Эх орноо хамгаалсанд баярлалаа 🛡️",
        "Хүндэтгэл, бахархал 🇲🇳",
      ],
      footer: "Цэргийн баяр © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🛡️", "⭐", "🇲🇳", "💪", "🎖️", "✨", "🏅", "🦅", "💫", "🏆"],
      heartRain: ["🛡️", "⭐", "🇲🇳", "💪", "🎖️", "✨", "🏅", "💫", "🦅"],
      confettiColors: ["#263238", "#37474f", "#546e7a", "#78909c", "#b0bec5", "#eceff1", "#fff", "#1b5e20"],
      stickers: STICKERS_MILITARY,
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// BIRTHDAY / Төрсөн өдөр TEMPLATES
// ═══════════════════════════════════════════════════════════════

const BIRTHDAY_TEMPLATES = [
  {
    id: "birthday-fun",
    category: "birthday",
    customizer: null,
    card: {
      name: "Баяр хөөртэй төрсөн өдөр 🎂",
      desc: "Хөгжилтэй, өнгөлөг, баярын уур амьсгал",
      preview: "🎂🎉",
      tags: ["🎉 Хөгжилтэй", "🎈 Баярын"],
    },
    theme: {
      className: "theme-candy",
      colors: {
        "--t-primary": "#7c4dff",
        "--t-secondary": "#b388ff",
        "--t-accent": "#ea80fc",
        "--t-accent2": "#ff80ab",
        "--t-soft": "#e1bee7",
        "--t-light": "#f3e5f5",
        "--t-bg": "#0a0015",
        "--t-bg2": "#150025",
        "--t-glass": "rgba(124, 77, 255, 0.05)",
        "--t-glass-border": "rgba(124, 77, 255, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_CAKE },
      title: "Төрсөн өдрийн мэнд! 🎂",
      subtitle: "Энэ онцгой өдрөөр чамд мэндчилгээ 🎉",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Бэлэг нээх 🎁",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      envelope: { emoji: "🎁", text: "Нээж үзээрэй...", sparkleEmoji: "🎉" },
      decorations: { top: "🎈", bottom: "🎂", divider: "★" },
      heartTrail: ["🎈", "🎉", "✨", "🎊", "⭐"],
      closeButtonText: "Уншлаа 🎉",
      title: "Төрсөн өдрийн мэндчилгээ 🎂",
      content:
        "Энэ онцгой өдрөөр чамд хамгийн сайн сайхныг хүсье!\nАмьдралын замд аз жаргал, эрүүл мэнд, амжилт дагуулахын ерөөе!\nТөрсөн өдрийн баярын мэнд! 🎂✨",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerIcon: "🎂",
      headerTitle: "Дурсамжууд 📸",
      continueButton: "Үргэлжлүүлэх 🎉",
      memories: [
        { type: "image", src: "", date: "Гоё мөч", caption: "Хамтын мөч 🎉" },
        { type: "image", src: "", date: "Инээмсэглэл", caption: "Аз жаргал ✨" },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "🎁",
          title: "Ямар бэлэг авмаар байна?",
          key: "gift",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🎮", name: "Тоглоом", desc: "Тоглоомын бэлэг", value: "Тоглоом" },
            { emoji: "👟", name: "Пүүз", desc: "Cool пүүз", value: "Пүүз" },
            { emoji: "📱", name: "Утас", desc: "Шинэ утас", value: "Утас" },
            { emoji: "🎧", name: "Чихэвч", desc: "Wireless чихэвч", value: "Чихэвч" },
            { emoji: "🎂", name: "Бялуу", desc: "Амтат бялуу", value: "Бялуу" },
            { emoji: "💝", name: "Сюрприз", desc: "Чи шийд!", value: "Сюрприз" },
          ],
        },
        {
          emoji: "🎈",
          title: "Хаана тэмдэглэх вэ?",
          key: "place",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "🏠", name: "Гэрт", desc: "Тохилог party", value: "Гэрт" },
            { emoji: "🍕", name: "Ресторан", desc: "Гадуур идье", value: "Ресторан" },
            { emoji: "🎳", name: "Боулинг", desc: "Хөгжилтэй!", value: "Боулинг" },
            { emoji: "🎤", name: "Каракоке", desc: "Дуулъя!", value: "Каракоке" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🎂",
      title: "Төрсөн өдрийн мэнд! 🎉",
      subtitle: "Аз жаргал, амжилт хүсье!",
      dateRow: { emoji: "🎂", label: "Баяр", value: "Төрсөн өдөр 🎉" },
      summaryFields: [
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
        { key: "place", emoji: "📍", label: "Газар" },
      ],
      quotes: [
        "Төрсөн өдрийн баярын мэнд хүргэе! 🎂",
        "Энэ жил чамд хамгийн сайхан жил болох болтугай! ✨",
        "Аз жаргал дагуулахын ерөөе! 🎉",
      ],
      footer: "Төрсөн өдөр © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🎂", "🎈", "🎉", "🎁", "✨", "🎊", "⭐", "💫", "🎀", "🪅"],
      heartRain: ["🎂", "🎈", "🎉", "🎁", "✨", "🎊", "⭐", "💫", "🎀"],
      confettiColors: ["#7c4dff", "#b388ff", "#ea80fc", "#ff80ab", "#e1bee7", "#f3e5f5", "#fff", "#6200ea"],
      clickSparkles: ["🎈", "🎉", "✨", "🎊"],
      stickers: STICKERS_FESTIVE,
    },
  },
  {
    id: "birthday-elegant",
    category: "birthday",
    customizer: null,
    card: {
      name: "Гоёмсог төрсөн өдөр ✨",
      desc: "Энгийн, гоёмсог, сэтгэл хөдлөм",
      preview: "✨🎁",
      tags: ["✨ Гоёмсог", "💌 Захидал"],
    },
    theme: {
      className: "theme-classic",
      colors: {
        "--t-primary": "#c62828",
        "--t-secondary": "#ef5350",
        "--t-accent": "#ff8a80",
        "--t-accent2": "#ff5252",
        "--t-soft": "#ffcdd2",
        "--t-light": "#ffebee",
        "--t-bg": "#100005",
        "--t-bg2": "#1a0008",
        "--t-glass": "rgba(198, 40, 40, 0.05)",
        "--t-glass-border": "rgba(198, 40, 40, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_GIFT },
      title: "Happy Birthday! ✨",
      subtitle: "Онцгой өдрийн онцгой мэндчилгээ 🎁",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Нээх ✨",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      envelope: { emoji: "✨", text: "Нээж үзээрэй...", sparkleEmoji: "🎁" },
      title: "Чамд... ✨",
      content:
        "Энэ өдрөөр чамд хамгийн сайн сайхныг хүсэж байна.\nЧи бол миний амьдралд гоо сайхныг авчирдаг хүн.\nТөрсөн өдрийн мэнд! ✨",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      memories: [
        { type: "image", src: "", date: "Онцгой мөч", caption: "Хамтын аз жаргал ✨" },
      ],
    },
    stepQuestions: null,
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "✨",
      title: "Happy Birthday! 🎁",
      subtitle: "Чамд зориулсан мэндчилгээ",
      dateRow: { emoji: "✨", label: "Баяр", value: "Төрсөн өдөр" },
      summaryFields: [],
      quotes: [
        "Happy Birthday! 🎁✨",
        "Аз жаргал хүсье! 🎂",
        "Чамд хамгийн сайхныг! ✨",
      ],
      footer: "Төрсөн өдөр © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["✨", "🎁", "🎂", "⭐", "🎉", "💫", "🎊", "🎈", "🎀", "💝"],
      stickers: STICKERS_FESTIVE,
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// VALENTINE / Хайрын баяр TEMPLATES
// ═══════════════════════════════════════════════════════════════

const VALENTINE_TEMPLATES = [
  {
    id: "valentine-classic",
    category: "valentine",
    customizer: null,
    card: {
      name: "Зүрхний мэндчилгээ 💕",
      desc: "Сонгодог Valentine's Day стиль",
      preview: "💕❤️",
      tags: ["💕 Романтик", "✨ Анимэйшн"],
    },
    theme: {
      className: "theme-crush-shy",
      colors: {
        "--t-primary": "#ff6b9d",
        "--t-secondary": "#ff4081",
        "--t-accent": "#f093fb",
        "--t-accent2": "#f5576c",
        "--t-soft": "#ff9a9e",
        "--t-light": "#ffd1dc",
        "--t-bg": "#120018",
        "--t-bg2": "#1e0028",
        "--t-glass": "rgba(255, 107, 157, 0.05)",
        "--t-glass-border": "rgba(255, 107, 157, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_HEART },
      title: "Happy Valentine's Day! 💕",
      subtitle: "Чамд зориулсан онцгой мэндчилгээ ❤️",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      decorations: { top: "💕", bottom: "🌹", divider: "♥" },
      title: "Миний зүрхний захидал 💌",
      content:
        "Чи бол миний амьдралын хамгийн гоо зүйл.\nЧиний инээмсэглэл намайг аз жаргалтай болгодог.\nHappy Valentine's Day, хайр минь! ❤️",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerTitle: "Бидний дурсамжууд 💕",
      continueButton: "Үргэлжлүүлэх 💕",
      memories: [
        { type: "image", src: "", date: "Анхны мөч", caption: "Хамтын анхны мөч... ✨" },
        { type: "image", src: "", date: "Хайрын мөч", caption: "Хайрын мөч 💕" },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "☕",
          title: "Хаана уулзах вэ?",
          key: "place",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "☕", name: "Кафе", desc: "Тайван яриа", value: "Кафе" },
            { emoji: "🍽️", name: "Ресторан", desc: "Гоёмсог хоол", value: "Ресторан" },
            { emoji: "🎬", name: "Кино", desc: "Хамтдаа кино", value: "Кино" },
            { emoji: "🌸", name: "Парк", desc: "Алхаж ярилцъя", value: "Парк" },
          ],
        },
        {
          emoji: "🎁",
          title: "Юу бэлэглэх вэ?",
          key: "gift",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🌹", name: "Цэцэг", desc: "Улаан сарнай", value: "Цэцэг" },
            { emoji: "🍫", name: "Шоколад", desc: "Амтат бэлэг", value: "Шоколад" },
            { emoji: "💍", name: "Бөгж", desc: "Онцгой бэлэг", value: "Бөгж" },
            { emoji: "💝", name: "Сюрприз", desc: "Чи шийд!", value: "Сюрприз" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      title: "Happy Valentine's Day! 💕",
      subtitle: "Хайр хүндэтгэлтэйгээр",
      dateRow: { emoji: "💕", label: "Баяр", value: "2-р сарын 14 ❤️" },
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "Хайр бол хамгийн гоо зүйл 💕",
        "Чамтай хамт байх бүр аз жаргалтай ❤️",
        "Happy Valentine's Day! 💕✨",
      ],
      footer: "Valentine's Day © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["❤️", "💕", "💖", "💗", "💝", "🥰", "✨", "💘", "💓", "💞"],
      heartRain: ["❤️", "💖", "💗", "💕", "💘", "💝", "🩷", "🤍", "💜"],
      stickers: STICKERS_LOVE,
    },
  },
  {
    id: "valentine-cute",
    category: "valentine",
    customizer: null,
    card: {
      name: "Хөөрхөн Valentine 🧸",
      desc: "Cute, хөөрхөн стиль",
      preview: "🧸💗",
      tags: ["🧸 Cute", "💗 Хөөрхөн"],
    },
    theme: {
      className: "theme-new-sweet",
      colors: {
        "--t-primary": "#f06292",
        "--t-secondary": "#f8bbd0",
        "--t-accent": "#fce4ec",
        "--t-accent2": "#ff80ab",
        "--t-soft": "#fff0f5",
        "--t-light": "#fff5f8",
        "--t-bg": "#1a0510",
        "--t-bg2": "#250818",
        "--t-glass": "rgba(240, 98, 146, 0.05)",
        "--t-glass-border": "rgba(240, 98, 146, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_BEAR },
      title: "Valentine's Day 💗",
      subtitle: "Хамгийн хөөрхөн мэндчилгээ чамдаа 🧸",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Нээх 💗",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      title: "Хайрт минь... 💗",
      content:
        "Чи бол миний хамгийн хайртай хүн.\nЧамтай хамт байх бүр л аз жаргалтай.\nI love you! 🧸💗",
    },
    question: null,
    memoryGallery: null,
    stepQuestions: null,
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      title: "I Love You! 💗",
      subtitle: "Valentine's Day 2026",
      dateRow: { emoji: "💗", label: "Баяр", value: "2-р сарын 14 🧸" },
      summaryFields: [],
      quotes: [
        "I love you! 💗",
        "Чи бол хамгийн хөөрхөн! 🧸",
        "Forever & always 💗✨",
      ],
      footer: "Valentine's Day © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["💗", "🧸", "💕", "🌸", "✨", "💖", "🎀", "💓", "🩷", "💝"],
      stickers: STICKERS_LOVE,
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// GENERAL / Ерөнхий мэндчилгээ TEMPLATES
// ═══════════════════════════════════════════════════════════════

const GENERAL_TEMPLATES = [
  {
    id: "general-thanks",
    category: "general",
    customizer: null,
    card: {
      name: "Талархлын мэндчилгээ 🙏",
      desc: "Баярлалаа, талархаж байна гэж хэлмээр үед",
      preview: "🙏✨",
      tags: ["🙏 Талархал", "✨ Анимэйшн"],
    },
    theme: {
      className: "theme-classic",
      colors: {
        "--t-primary": "#ff8f00",
        "--t-secondary": "#ffb300",
        "--t-accent": "#ffe082",
        "--t-accent2": "#ffd54f",
        "--t-soft": "#fff8e1",
        "--t-light": "#fffde7",
        "--t-bg": "#120a00",
        "--t-bg2": "#1e1200",
        "--t-glass": "rgba(255, 143, 0, 0.05)",
        "--t-glass-border": "rgba(255, 143, 0, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_GIFT },
      title: "Баярлалаа! 🙏",
      subtitle: "Танд зориулсан талархлын мэндчилгээ ✨",
      timer: null,
      buttonText: "Нээх ✨",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      envelope: { emoji: "🙏", text: "Нээж үзээрэй...", sparkleEmoji: "✨" },
      title: "Танд баярлалаа... 🙏",
      content:
        "Таны сэтгэл, хүндэтгэл, тусламжид чин сэтгэлээсээ баярлалаа.\nТа бол миний амьдралд чухал хүн.\nТалархаж байна! 🙏✨",
    },
    question: null,
    memoryGallery: null,
    stepQuestions: null,
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🙏",
      title: "Баярлалаа! ✨",
      subtitle: "Чин сэтгэлээсээ талархаж байна",
      dateRow: { emoji: "🙏", label: "", value: "Талархалтайгаар ✨" },
      summaryFields: [],
      quotes: [
        "Баярлалаа! 🙏",
        "Танд маш их талархаж байна ✨",
        "Та бол хамгийн шилдэг! 🌟",
      ],
      footer: "Мэндчилгээ © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🙏", "✨", "⭐", "💫", "🌟", "🎉", "💛", "🌻", "☀️", "💐"],
      heartRain: ["✨", "⭐", "💫", "🌟", "💛", "🙏", "☀️", "🌻", "💐"],
      confettiColors: ["#ff8f00", "#ffb300", "#ffe082", "#ffd54f", "#fff8e1", "#fffde7", "#fff", "#e65100"],
      stickers: STICKERS_FESTIVE,
    },
  },
  {
    id: "general-congrats",
    category: "general",
    customizer: null,
    card: {
      name: "Баяр хүргэе! 🎊",
      desc: "Амжилт, ахиц, баярт үйл явдал",
      preview: "🎊🎉",
      tags: ["🎊 Баяр", "🎈 Хөгжилтэй"],
    },
    theme: {
      className: "theme-candy",
      colors: {
        "--t-primary": "#6200ea",
        "--t-secondary": "#7c4dff",
        "--t-accent": "#b388ff",
        "--t-accent2": "#ea80fc",
        "--t-soft": "#e1bee7",
        "--t-light": "#f3e5f5",
        "--t-bg": "#0a0018",
        "--t-bg2": "#150028",
        "--t-glass": "rgba(98, 0, 234, 0.05)",
        "--t-glass-border": "rgba(98, 0, 234, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_GIFT },
      title: "Баяр хүргэе! 🎊",
      subtitle: "Амжилт чинь тантай хамт! 🎉",
      timer: null,
      buttonText: "Нээх 🎊",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      envelope: { emoji: "🎊", text: "Нээж үзээрэй...", sparkleEmoji: "🎉" },
      decorations: { top: "🎊", bottom: "🎉", divider: "★" },
      title: "Баяр хүргэе! 🎊",
      content:
        "Таны амжилт бидний бахархал!\nИлүү ихийг хийж чадна гэдэгт итгэж байна.\nБаяр хүргэе! 🎊✨",
    },
    question: null,
    memoryGallery: null,
    stepQuestions: null,
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🎊",
      title: "Баяр хүргэе! 🎉",
      subtitle: "Амжилт хүсье!",
      dateRow: { emoji: "🎊", label: "", value: "Баярын мэндчилгээ 🎉" },
      summaryFields: [],
      quotes: [
        "Баяр хүргэе! 🎊",
        "Амжилт дагуулахын ерөөе! ✨",
        "Та бол шилдэг! 🏆",
      ],
      footer: "Мэндчилгээ © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🎊", "🎉", "🎈", "✨", "🏆", "⭐", "💫", "🎁", "🎀", "🪅"],
      heartRain: ["🎊", "🎉", "🎈", "✨", "🏆", "⭐", "💫", "🎁", "🎀"],
      confettiColors: ["#6200ea", "#7c4dff", "#b388ff", "#ea80fc", "#e1bee7", "#f3e5f5", "#fff", "#aa00ff"],
      stickers: STICKERS_FESTIVE,
    },
  },
  {
    id: "general-newyear",
    category: "general",
    customizer: null,
    card: {
      name: "Шинэ жилийн мэнд 🎆",
      desc: "Шинэ жилийн баярын мэндчилгээ",
      preview: "🎆✨",
      tags: ["🎆 Шинэ жил", "✨ Гоёмсог"],
    },
    theme: {
      className: "theme-starry",
      colors: {
        "--t-primary": "#ffd700",
        "--t-secondary": "#ffeb3b",
        "--t-accent": "#fff176",
        "--t-accent2": "#ffee58",
        "--t-soft": "#fff9c4",
        "--t-light": "#fffde7",
        "--t-bg": "#0a0a00",
        "--t-bg2": "#151500",
        "--t-glass": "rgba(255, 215, 0, 0.05)",
        "--t-glass-border": "rgba(255, 215, 0, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_STAR },
      title: "Шинэ жилийн мэнд! 🎆",
      subtitle: "Шинэ жилийн баяраар мэндчилгээ 🎊",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Нээх 🎆",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      envelope: { emoji: "🎆", text: "Нээж үзээрэй...", sparkleEmoji: "✨" },
      title: "Шинэ жилийн мэндчилгээ 🎆",
      content:
        "Шинэ жилийн баяраар мэндчилгээ дэвшүүлье!\nАз жаргал, эрүүл энх, амжилт бүгд танд байх болтугай.\nШинэ жилийн мэнд! 🎆✨",
    },
    question: null,
    memoryGallery: null,
    stepQuestions: null,
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🎆",
      title: "Шинэ жилийн мэнд! 🎊",
      subtitle: "Аз жаргал хүсье!",
      dateRow: { emoji: "🎆", label: "Баяр", value: "Шинэ жил ✨" },
      summaryFields: [],
      quotes: [
        "Шинэ жилийн мэнд! 🎆",
        "Аз жаргал, амжилт хүсье! ✨",
        "Шинэ жил шинэ эхлэл! 🌟",
      ],
      footer: "Шинэ жил © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🎆", "🎇", "✨", "🎊", "🎉", "⭐", "💫", "🌟", "🎈", "🪅"],
      heartRain: ["🎆", "🎇", "✨", "🎊", "🎉", "⭐", "💫", "🌟", "🎈"],
      confettiColors: ["#ffd700", "#ffeb3b", "#fff176", "#ffee58", "#fff9c4", "#fffde7", "#fff", "#ff6f00"],
      stickers: STICKERS_FESTIVE,
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const CATEGORIES_CONFIG = {
  "march8": MARCH8_TEMPLATES,
  "soldiers-day": SOLDIERS_DAY_TEMPLATES,
  "birthday": BIRTHDAY_TEMPLATES,
  "valentine": VALENTINE_TEMPLATES,
  "general": GENERAL_TEMPLATES,
};

export function getTemplatesByCategory(categoryId) {
  return CATEGORIES_CONFIG[categoryId] || [];
}

export function getAllTemplates() {
  return Object.values(CATEGORIES_CONFIG).flat();
}

export function getCategoryConfig(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId) || null;
}

// Backward compatibility
export const TEMPLATES = getAllTemplates();
