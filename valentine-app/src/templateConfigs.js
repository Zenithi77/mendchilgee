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
    desc: "Цэргийн алба хаасан эрэлхэг эрэгтэйд зориулсан мэндчилгээ",
    vibe: "Эрэлхэг, хүндэтгэл, баатарлаг",
    gradient: "linear-gradient(135deg, #1a3a5c, #2c6fad)",
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
      title: "Ээждээ зориулав 🌷",
      subtitle: "3-р сарын 8-ны баяраар ээж, эгч, эмээдээ хайраа илэрхийлье 💝",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      decorations: { top: "💝", bottom: "🌺", divider: "♥" },
      title: "Хайрт ээждээ... 💌",
      content:
        "Ээж минь, та бол миний амьдралын хамгийн дулаахан гэрэл.\nТаны хайр халамж, тэвэрлэлт бүр надад хүч өгдөг.\nТанийг маш их хайрладаг, баярын мэнд хүргэе! 🌷",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerTitle: "Гэр бүлийн дурсамжууд 💝",
      continueButton: "Үргэлжлүүлэх 🌸",
      memories: [
        { type: "image", src: "", date: "Хамтын мөч", caption: "Ээжтэйгээ хамтдаа 💝" },
        { type: "image", src: "", date: "Дурсамж", caption: "Хамгийн сайхан мөчүүд 🌷" },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      title: "3-р сарын 8-ны мэнд! 🌷",
      subtitle: "Ээж, эгч, эмээдээ баярын мэнд хүргэе!",
      dateRow: { emoji: "🌷", label: "Баяр", value: "3-р сарын 8 💐" },
      summaryFields: [
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
        { key: "place", emoji: "📍", label: "Газар" },
      ],
      quotes: [
        "Ээж бол дэлхийн хамгийн үнэтэй хүн 💝",
        "Ээжийн хайр бол хязгааргүй наран 🌷",
        "Эмээ минь, таны мэргэн ухаан миний зам гэрэлтүүлсэн 🌸",
        "Эгч минь, та бол миний жишээ, тулгуур баганы минь ✨",
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
      title: "Хамт олондоо мэнд! 🌸",
      subtitle: "Ангийн охид, ажлын хамт олон, найз бүсгүйчүүддээ 🎀",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх ✨",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      title: "Хамт олондоо хүргэж байна 💌",
      content:
        "Та бүхэн бол миний өдөр бүрийг гэрэлтүүлдэг хүмүүс.\nХамт инээж, хамт ажиллаж, хамт байсан цаг бүхэн миний хувьд онцгой.\n3-р сарын 8-ны баяраар та бүхэнд баярын мэnд хүргэе! 🌸",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerTitle: "Хамтын мөчүүд 📸",
      continueButton: "Үргэлжлүүлэх 🎀",
      memories: [
        { type: "image", src: "", date: "Хамтын мөч", caption: "Хөгжилтэй хамт олон 🌸" },
        { type: "image", src: "", date: "Баярын мөч", caption: "Хамтдаа цаг үргэлж гоё ✨" },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      title: "Хамт олондоо мэнд! 🌸",
      subtitle: "3-р сарын 8-ны баяраар",
      dateRow: { emoji: "🌸", label: "Баяр", value: "3-р сарын 8" },
      summaryFields: [],
      quotes: [
        "Хамт олонтойгоо байх бүр өдөр гэрэлтэй 🌸",
        "Та бүхэнтэй хамт ажиллах бол азын хэрэг ✨",
        "Гоё бүсгүйчүүддээ баярын мэнд хүргэе! 🎀",
        "Хамтдаа бид бүхнийг чаддаг 💪🌷",
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
      desc: "Багш, талархдаг хүн, хайртай охиндоо зориулсан",
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
      subtitle: "Хүндэтгэл, талархлын мэдрэмжээ илэрхийлье ✨",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LETTER_UI,
      decorations: { top: "✨", bottom: "🌹", divider: "♥" },
      title: "Талархлын захидал 💌",
      content:
        "Таны сургаал, дэмжлэг, сайхан сэтгэл миний хувьд маш их утга учиртай.\nТа бол миний амьдралд нөлөөлсөн онцгой хүн.\n3-р сарын 8-ны баяраар танд чин сэтгэлийн мэнд хүргэе! 🌹",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerTitle: "Дурсамжууд 📸",
      continueButton: "Үргэлжлүүлэх 🌹",
      memories: [
        { type: "image", src: "", date: "Онцгой мөч", caption: "Хамтын мөч бүр үнэтэй ✨" },
        { type: "image", src: "", date: "Инээмсэглэл", caption: "Таны инээмсэглэл бүхнийг гоёдог 🌹" },
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
        "Таны сургаал миний амьдралыг өөрчилсөн ✨",
        "Эмэгтэй хүн бий газар цэцэг дэлгэрнэ 🌸",
        "Та бол онцгой хүн, талархлаа илэрхийлье 🌹",
        "Хүндэтгэл, талархал зүрхнээс 💫",
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
  // ── 1. Жинхэнэ Баатар — Navy + Gold premium загвар ──
  {
    id: "soldiers-honor",
    category: "soldiers-day",
    customizer: null,
    card: {
      name: "Жинхэнэ Баатар 🎖️",
      desc: "Цэргийн алба хаасан эрэлхэг зоригт баатарт — хүндэтгэл, бахархлын мэндчилгээ",
      preview: "🎖️⭐",
      tags: ["🎖️ Хүндэтгэл", "⭐ Premium"],
    },
    theme: {
      className: "theme-military",
      colors: {
        "--t-primary": "#1565c0",
        "--t-secondary": "#42a5f5",
        "--t-accent": "#90caf9",
        "--t-accent2": "#64b5f6",
        "--t-soft": "#bbdefb",
        "--t-light": "#e3f2fd",
        "--t-bg": "#080c18",
        "--t-bg2": "#0d1525",
        "--t-glass": "rgba(21, 101, 192, 0.05)",
        "--t-glass-border": "rgba(21, 101, 192, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_STAR },
      title: "Эрэлхэг Баатарт 🎖️",
      subtitle: "Эх орныхоо төлөө зүрх сэтгэлээ зориулсан\nжинхэнэ баатарт хүндэтгэлтэйгээр ⭐",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх 🎖️",
    },
    loveLetter: {
      enabled: true,
      envelope: { emoji: "🎖️", text: "Нээж үзээрэй...", sparkleEmoji: "⭐" },
      decorations: { top: "⭐", bottom: "🎖️", divider: "★" },
      heartTrail: ["⭐", "🎖️", "✨", "💫", "🏅"],
      closeButtonText: "Уншлаа ⭐",
      title: "Хүндэт Баатарт... 🎖️",
      content:
        "Та эх орныхоо ариун нутгийг хамгаалж,\nхүйтэн салхинд нүүрээ тавьж, шөнийн харуулд зогссон.\n\nТаны хоёр мөрөн дээр Монголын туг амарч,\nТаны алхам бүр энэ нутгийн аюулгүй байдлыг баталсан.\n\nЦэргийн алба бол зүгээр нэг үүрэг биш —\nэнэ бол эр хүний хамгийн дээд нэр хүнд.\n\nТаньд баярын мэнд хүргэе, жинхэнэ баатар минь! 🎖️🇲🇳",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerIcon: "⭐",
      headerTitle: "Алдар гавьяа",
      continueButton: "Үргэлжлүүлэх 🎖️",
      memories: [
        { type: "image", src: "", date: "Баатарлаг мөч", caption: "Эх орны алба 🎖️" },
        { type: "image", src: "", date: "Бахархлын мөч", caption: "Зориг тэвчээрийн жилүүд ⭐" },
        { type: "image", src: "", date: "Алдар", caption: "Монгол баатрын замнал 🇲🇳" },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🎖️",
      title: "Баярын мэнд, Баатар минь! ⭐",
      subtitle: "Эрэлхэг зоригт эр хүнд хүндэтгэлтэйгээр",
      dateRow: { emoji: "🎖️", label: "Баяр", value: "Цэргийн баяр" },
      summaryFields: [
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "Жинхэнэ эр хүн — эх орноо хамгаалсан хүн 🎖️",
        "Таны зориг бол Монголын бахархал ⭐",
        "Цэргийн алба — эрийн замын хамгийн хүндтэй алхам 💪",
        "Хатуужил бол хүч, тэвчээр бол ялалт 🛡️",
        "Эх орны хамгаалагч, ард түмний баатар 🇲🇳",
      ],
      footer: "Цэргийн баяр © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🎖️", "⭐", "🏅", "✨", "🛡️", "💫", "🇲🇳", "💪", "🦅", "🏆"],
      heartRain: ["⭐", "🎖️", "🏅", "✨", "💫", "🛡️", "🇲🇳", "💪", "🦅"],
      confettiColors: ["#1565c0", "#42a5f5", "#90caf9", "#d4a54a", "#bf8c2c", "#e3f2fd", "#fff", "#0d47a1"],
      clickSparkles: ["⭐", "🎖️", "✨", "🏅"],
      flowers: [
        { emoji: "⭐", size: 38 }, { emoji: "🎖️", size: 34 }, { emoji: "✨", size: 40 },
        { emoji: "🏅", size: 36 }, { emoji: "💫", size: 42 }, { emoji: "🛡️", size: 35 },
        { emoji: "🦅", size: 32 }, { emoji: "🇲🇳", size: 37 }, { emoji: "⭐", size: 30 },
        { emoji: "🎖️", size: 36 }, { emoji: "✨", size: 33 }, { emoji: "🏅", size: 38 },
      ],
      leafEmoji: "✨",
      stickers: STICKERS_MILITARY,
    },
  },

  // ── 2. Төмөр Зориг — Dark Steel, хатуу эрэлхэг загвар ──
  {
    id: "soldiers-strong",
    category: "soldiers-day",
    customizer: null,
    card: {
      name: "Төмөр Зориг 🛡️",
      desc: "Хатуу дайчин сэтгэлтэй, ган зоригтой эр хүнд зориулсан хүчтэй мэндчилгээ",
      preview: "🛡️💪",
      tags: ["💪 Хүчтэй", "🛡️ Дайчин"],
    },
    theme: {
      className: "theme-military-steel",
      colors: {
        "--t-primary": "#263238",
        "--t-secondary": "#37474f",
        "--t-accent": "#546e7a",
        "--t-accent2": "#78909c",
        "--t-soft": "#b0bec5",
        "--t-light": "#eceff1",
        "--t-bg": "#080a0e",
        "--t-bg2": "#10151c",
        "--t-glass": "rgba(38, 50, 56, 0.05)",
        "--t-glass-border": "rgba(38, 50, 56, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_STAR },
      title: "Дайчин Сэтгэлд 🛡️",
      subtitle: "Ган зоригтой, төмөр хатуужилтай\nэр хүнд зориулсан мэндчилгээ 💪",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх 🛡️",
    },
    loveLetter: {
      enabled: true,
      envelope: { emoji: "🛡️", text: "Нээж үзээрэй...", sparkleEmoji: "⭐" },
      decorations: { top: "🛡️", bottom: "⭐", divider: "★" },
      heartTrail: ["🛡️", "⭐", "🎖️", "💫", "✨"],
      closeButtonText: "Уншлаа 🛡️",
      title: "Жинхэнэ Дайчинд 🛡️",
      content:
        "Чи цэргийн хүнд хатуу сургуулийг туулж,\nхүйтэн шөнийн харуулд тэсч, нөхдөө хамгаалсан.\n\nЧиний нүдэнд дайчны гал асч,\nчиний зүрхэнд эх орны хайр шатаж байсан.\n\nТөмөр зориг, ган хатуужил — энэ чиний зан чанар.\nЦэргийн баяраар чамд хүндэтгэл илэрхийлье.\n\nЧи жинхэнэ дайчин! 🛡️🇲🇳",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerIcon: "🛡️",
      headerTitle: "Дайчны замнал",
      continueButton: "Үргэлжлүүлэх 🛡️",
      memories: [
        { type: "image", src: "", date: "Эхний өдрүүд", caption: "Ган хатуужил 💪" },
        { type: "image", src: "", date: "Нөхдийн хамт", caption: "Ах дүүсийн холбоо 🛡️" },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🛡️",
      title: "Дайчинд баярын мэнд! 🛡️",
      subtitle: "Хатуужил, зориг, нэр хүндийн баатарт",
      dateRow: { emoji: "🛡️", label: "Баяр", value: "Цэргийн баяр 🇲🇳" },
      summaryFields: [],
      quotes: [
        "Жинхэнэ хүч бол зүрхний хүч 💪",
        "Дайчин сэтгэл — мөнхийн зориг 🛡️",
        "Эх орноо хамгаалсан гарт хүндэтгэл 🇲🇳",
        "Цэргийн алба — эрийн дээд шалгуур ⭐",
        "Ган хатуужил чамайг баатар болгосон 🦅",
      ],
      footer: "Цэргийн баяр © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🛡️", "⭐", "🇲🇳", "💪", "🎖️", "✨", "🏅", "🦅", "💫", "🏆"],
      heartRain: ["🛡️", "⭐", "🇲🇳", "💪", "🎖️", "✨", "🏅", "💫", "🦅"],
      confettiColors: ["#263238", "#37474f", "#546e7a", "#78909c", "#b0bec5", "#90a4ae", "#fff", "#455a64"],
      clickSparkles: ["🛡️", "⭐", "✨", "💪"],
      flowers: [
        { emoji: "🛡️", size: 38 }, { emoji: "⭐", size: 34 }, { emoji: "🇲🇳", size: 40 },
        { emoji: "💪", size: 36 }, { emoji: "🎖️", size: 42 }, { emoji: "✨", size: 35 },
        { emoji: "🏅", size: 32 }, { emoji: "🦅", size: 37 }, { emoji: "🛡️", size: 30 },
        { emoji: "⭐", size: 36 }, { emoji: "🇲🇳", size: 33 }, { emoji: "🎖️", size: 38 },
      ],
      leafEmoji: "⭐",
      stickers: STICKERS_MILITARY,
    },
  },

  // ── 3. Алтан Одон — Premium алтан загвар 🏅 ──
  {
    id: "soldiers-pride",
    category: "soldiers-day",
    customizer: null,
    card: {
      name: "Алтан Одон 🏅",
      desc: "Цэргийн алба хаасан эрийн нэр хүндийг өргөсөн — хамгийн гоёмсог алтан загвар",
      preview: "🏅🦅",
      tags: ["🏅 Premium", "🦅 Алтан"],
    },
    theme: {
      className: "theme-military-gold",
      colors: {
        "--t-primary": "#bf8c2c",
        "--t-secondary": "#d4a54a",
        "--t-accent": "#e8c86e",
        "--t-accent2": "#f0d78a",
        "--t-soft": "#f8e8b0",
        "--t-light": "#fdf5e0",
        "--t-bg": "#0a0805",
        "--t-bg2": "#161008",
        "--t-glass": "rgba(191, 140, 44, 0.06)",
        "--t-glass-border": "rgba(191, 140, 44, 0.18)",
      },
    },
    welcome: {
      character: {
        type: "emoji",
        wrapClass: "welcome-char moon-char",
        bodyEmoji: "🏅",
        bodyClass: "moon-body",
        accentContainerClass: "moon-stars",
        accentItemClass: "moon-star",
        accents: ["⭐", "✨", "🎖️", "💫", "🦅"],
      },
      title: "Алба хаасан Баатарт 🏅",
      subtitle: "Цэргийн жинхэнэ алба хаасан эрэлхэг эрэгтэйд\nзориулсан онцгой гоёмсог мэндчилгээ 🦅",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Мэндчилгээ нээх 🏅",
    },
    loveLetter: {
      enabled: true,
      envelope: { emoji: "🏅", text: "Нээж үзээрэй...", sparkleEmoji: "✨" },
      decorations: { top: "🏅", bottom: "🦅", divider: "★" },
      heartTrail: ["🏅", "⭐", "🎖️", "✨", "🦅"],
      closeButtonText: "Уншлаа 🏅",
      title: "Хайрт Баатартаа... 🏅",
      content:
        "Чи цэргийн жинхэнэ алба хааж, Монгол эрийн нэрийг өргөсөн.\nТэр хатуу жилүүд чамайг илүү хүчтэй, илүү зоригтой болгосон.\n\nЧиний тэвчээр, хатуужил, итгэл — бүгд миний бахархал.\nНөхдөөсөө салж, гэр бүлээсээ хол байсан ч\nчи нэг ч удаа сулдаагүй.\n\nЧамайгаа юу гэж хэлэхээ мэдэхгүй ч\nнэг л зүйлийг мэднэ — чи жинхэнэ баатар.\n\nЦэргийн баяраар чамд энэ мэндчилгээг\nзүрхнээсээ хүргэж байна! 🏅🇲🇳",
    },
    question: null,
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerIcon: "🏅",
      headerTitle: "Алба хаасан он жилүүд",
      continueButton: "Үргэлжлүүлэх 🦅",
      memories: [
        { type: "image", src: "", date: "Алба эхэлсэн", caption: "Эрийн замын эхлэл 🎖️" },
        { type: "image", src: "", date: "Хамт олон", caption: "Нөхдийн хамт 🛡️" },
        { type: "image", src: "", date: "Халагдсан өдөр", caption: "Баатарлаг замналаа дуусгасан 🏅" },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🏅",
      title: "Баярын мэнд, Алтан Баатар! 🏅",
      subtitle: "Цэргийн жинхэнэ алба хаасан эрэлхэг баатарт",
      dateRow: { emoji: "🏅", label: "Баяр", value: "Цэргийн баяр 🇲🇳" },
      summaryFields: [
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "Цэргийн алба хаасан эр хүн — Монголын бахархал 🏅",
        "Алтан одон зүрхэнд, ган зориг цусанд 🦅",
        "Хатуужил, зориг, тэвчээр — эрийн гурван эрдэнэ ⭐",
        "Эх орныхоо төлөө зориулсан жилүүд — алтан хуудас 🇲🇳",
        "Жинхэнэ баатрыг цэргийн алба хаасан нь тодорхойлдог 💪",
      ],
      footer: "Цэргийн баяр © 2026 • mendchilgee.site",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🏅", "⭐", "🎖️", "✨", "🦅", "💫", "🇲🇳", "💪", "🛡️", "🏆"],
      heartRain: ["🏅", "⭐", "🎖️", "✨", "🦅", "💫", "🇲🇳", "💪", "🛡️"],
      confettiColors: ["#bf8c2c", "#d4a54a", "#e8c86e", "#f0d78a", "#1a3a5c", "#2c6fad", "#fff", "#8b6914"],
      clickSparkles: ["🏅", "⭐", "✨", "🦅"],
      flowers: [
        { emoji: "🏅", size: 38 }, { emoji: "⭐", size: 34 }, { emoji: "🎖️", size: 40 },
        { emoji: "✨", size: 36 }, { emoji: "🦅", size: 42 }, { emoji: "💫", size: 35 },
        { emoji: "🇲🇳", size: 32 }, { emoji: "🛡️", size: 37 }, { emoji: "🏅", size: 30 },
        { emoji: "⭐", size: 36 }, { emoji: "🎖️", size: 33 }, { emoji: "🦅", size: 38 },
      ],
      leafEmoji: "💫",
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
