/*
  Template configurations organized by CATEGORY (relationship stage).
  Each template is structured by component sections for easy database integration.

  Structure per template:
  ─ card:            Template selector display info
  ─ theme:           CSS theme class and color variables
  ─ customizer:      Optional customizer type (e.g. 'spark')
  ─ welcome:         Welcome page (character, title, timer, button)
  ─ loveLetter:      Love letter overlay (envelope, content, decorations)
  ─ question:        Question page (character, text, buttons, no-messages)
  ─ memoryGallery:   Memory gallery (header, memories, buttons)
  ─ stepQuestions:    Step questions (UI labels, steps array)
  ─ finalSummary:    Final summary (fields, meter, quotes, signature)
  ─ effects:         Visual effects (emojis, colors, stickers, flowers)
*/

// ═══════════════════════════════════════════════════════════════
// SHARED DEFAULTS (internal helpers — each template is self-contained on export)
// ═══════════════════════════════════════════════════════════════

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
    "Чи битий нэрэлхээд байлдаа 😤",
    "Миний зүрх... 😭",
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
  doneButton: "Баталгаажуулах 💕",
};

const DEFAULT_LOVE_LETTER_UI = {
  envelope: { emoji: "💌", text: "Нээж үзээрэй...", sparkleEmoji: "✨" },
  decorations: { top: "💕", bottom: "🌹", divider: "♥" },
  heartTrail: ["❤️", "💕", "💖", "💗", "💓"],
  closeButtonText: "Уншлаа 💕",
};

const DEFAULT_GALLERY_UI = {
  headerIcon: "💝",
  headerTitle: "Бидний дурсамжууд",
  headerIconAnimation: "bearLove 1.5s ease infinite",
  placeholderHint: "Зургаа энд нэмнэ үү",
  footerText: "Бүх дурсамж үнэ цэнэтэй... 💕",
  continueButton: "Болзоо төлөвлөх 👩‍❤️‍👨",
};

const DEFAULT_FINAL_UI = {
  headerEmoji: "💝",
  title: "Бүх зүйл бэлэн! 🎉",
  subtitle: "2026 оны 2-р сарын 14 • Valentine's Day",
  dateRow: { emoji: "📅", label: "Огноо", value: "2026.02.14 ❤️" },
  meter: { label: "Догдлолын түвшин", text: "♾️ Хязгааргүй" },
  signature: "Forever Together",
  footer: "Valentine's Day 2026 • Made with ❤️",
};

const DEFAULT_EFFECTS = {
  floatingHearts: ["❤️", "💕", "💖", "💗", "💝", "🥰", "✨", "💘", "💓", "💞"],
  heartRain: ["❤️", "💖", "💗", "💕", "💘", "💝", "🩷", "🤍", "💜"],
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
  clickSparkles: ["✨", "💖", "💕", "⭐"],
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
  stickers: ["💕", "💖", "💗", "💓", "💞", "💘", "❤️‍🔥", "🥰", "😘", "💋"],
};

const STICKERS_LOVE = [
  "💕",
  "💖",
  "💗",
  "💓",
  "💞",
  "💘",
  "❤️‍🔥",
  "🥰",
  "😘",
  "💋",
];
const STICKERS_CUTE = [
  "🧸",
  "🎀",
  "🌸",
  "🦋",
  "✨",
  "⭐",
  "🌟",
  "💫",
  "🎪",
  "🎭",
];
const STICKERS_NATURE = [
  "🌹",
  "🌺",
  "🌸",
  "🌷",
  "💐",
  "🌻",
  "🌼",
  "🏵️",
  "🍀",
  "🌿",
];
const STICKERS_RETRO = [
  "💿",
  "📟",
  "📼",
  "🎮",
  "📞",
  "💾",
  "🖥️",
  "📻",
  "🎧",
  "📸",
];

const STICKERS_DISTANCE = [
  "🌍",
  "✈️",
  "💌",
  "🌙",
  "📱",
  "💕",
  "🕐",
  "🛫",
  "💫",
  "🌅",
];

// ─── Welcome character presets ───
const WELCOME_BEAR = {
  type: "bear",
  envelopeEmojis: { letter: "💌", heart: "💝" },
};
const WELCOME_MOON = {
  type: "emoji",
  wrapClass: "welcome-char moon-char",
  bodyEmoji: "🌙",
  bodyClass: "moon-body",
  accentContainerClass: "moon-stars",
  accentItemClass: "moon-star",
  accents: ["⭐", "✨", "⭐", "✨", "💫"],
};
const WELCOME_CAT = {
  type: "emoji",
  wrapClass: "welcome-char cat-char",
  bodyEmoji: "🐱",
  bodyClass: "cat-body",
  accentContainerClass: "cat-hearts",
  accentItemClass: "cat-heart",
  accents: ["💕", "🍬", "🧁"],
};
const WELCOME_BUTTERFLY = {
  type: "emoji",
  wrapClass: "welcome-char butterfly-char",
  bodyEmoji: "🦋",
  bodyClass: "butterfly-body",
  accentContainerClass: "butterfly-sparkles",
  accentItemClass: "bf-sparkle",
  accents: ["💕", "✨", "🌸", "💖"],
};
const WELCOME_FIRE = {
  type: "emoji",
  wrapClass: "welcome-char fire-char",
  bodyEmoji: "🔥",
  bodyClass: "fire-body",
  accentContainerClass: "fire-sparks",
  accentItemClass: "fire-spark",
  accents: ["❤️‍🔥", "⚡", "💥"],
};
const WELCOME_RETRO = {
  type: "emoji",
  wrapClass: "welcome-char retro-char",
  bodyEmoji: "📟",
  bodyClass: "retro-body",
  accentContainerClass: "retro-icons",
  accentItemClass: "retro-icon",
  accents: ["💿", "🦋", "📼", "💾"],
};

const WELCOME_PLANE = {
  type: "emoji",
  wrapClass: "welcome-char plane-char",
  bodyEmoji: "✈️",
  bodyClass: "plane-body",
  accentContainerClass: "plane-trails",
  accentItemClass: "plane-trail",
  accents: ["💌", "🌍", "💕", "✨"],
};

// ─── Question character presets ───
const QUESTION_BEAR = {
  type: "bear",
  loveEmoji: "💗",
  pulseRingClass: "pulse-ring",
};
const QUESTION_MOON = {
  type: "emoji",
  wrapClass: "question-char moon-question",
  bodyEmoji: "🌙",
  bodyClass: "moon-q-body",
  accentContainerClass: "moon-q-stars",
  accentItemClass: "mq-star",
  accents: ["⭐", "💫", "✨"],
  pulseRingClass: "pulse-ring pulse-ring-blue",
};
const QUESTION_CAT = {
  type: "emoji",
  wrapClass: "question-char cat-question",
  bodyEmoji: "🐱",
  bodyClass: "cat-q-body",
  accentContainerClass: "cat-q-items",
  accentItemClass: "cq-item",
  accents: ["🍬", "💕", "🧁"],
  pulseRingClass: "pulse-ring pulse-ring-pink",
};

const QUESTION_PLANE = {
  type: "emoji",
  wrapClass: "question-char plane-question",
  bodyEmoji: "✈️",
  bodyClass: "plane-q-body",
  accentContainerClass: "plane-q-items",
  accentItemClass: "pq-item",
  accents: ["🌍", "💌", "✨"],
  pulseRingClass: "pulse-ring pulse-ring-purple",
};

// ═══════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════

export const CATEGORIES = [
  {
    id: "crush",
    emoji: "😍",
    name: "Crush / Дурлал",
    desc: "Хараахан үерхээгүй, дурлаж байгаа хүндээ",
    vibe: "Ичимхий, зүрх догдлом, сэтгэл хөдлөм",
    gradient: "linear-gradient(135deg, #ff6b9d, #ff4081)",
    bgEmojis: ["💘", "😍", "🦋", "💌"],
    selectedText: "✓ Сонгогдсон",
    selectText: "Сонгох →",
  },
  {
    id: "new-couple",
    emoji: "💑",
    name: "Шинэ хос",
    desc: "Саяхан үерхэж эхэлсэн хосууд",
    vibe: "Шинэлэг, сэтгэл хөдлөм, хөөрхөн",
    gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    bgEmojis: ["💕", "🥰", "💗", "✨"],
    selectedText: "✓ Сонгогдсон",
    selectText: "Сонгох →",
  },
  {
    id: "long-term",
    emoji: "💍",
    name: "Удаан хос",
    desc: "Удаан хугацаанд хамт байгаа хосууд",
    vibe: "Гүнзгий хайр, итгэлцэл, хамтын дурсамж",
    gradient: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    bgEmojis: ["💝", "🫶", "💞", "🥂"],
    selectedText: "✓ Сонгогдсон",
    selectText: "Сонгох →",
  },
  {
    id: "y2k",
    emoji: "📟",
    name: "2000s Хосууд",
    desc: "2000 оны стилиар Valentine тэмдэглэе",
    vibe: "Retro, ностальги, дээр үеийн уур амьсгал",
    gradient: "linear-gradient(135deg, #00d2ff, #ff00e5)",
    bgEmojis: ["📟", "💿", "🦋", "⭐"],
    selectedText: "✓ Сонгогдсон",
    selectText: "Сонгох →",
  },
  {
    id: "long-distance",
    emoji: "🌍",
    name: "Холын хайр",
    desc: "Хол байсан ч зүрх ойрхон хосууд",
    vibe: "Санаа зовнил, итгэл, хүлээлт, хязгааргүй хайр",
    gradient: "linear-gradient(135deg, #667eea, #764ba2)",
    bgEmojis: ["🌍", "✈️", "💌", "🌙"],
    selectedText: "✓ Сонгогдсон",
    selectText: "Сонгох →",
  },
];

// ═══════════════════════════════════════════════════════════════
// CRUSH / Дурлал TEMPLATES
// ═══════════════════════════════════════════════════════════════

const CRUSH_TEMPLATES = [
  {
    id: "crush-shy",
    category: "crush",
    customizer: null,
    card: {
      name: "Удаан сэтгэл дотроо тээж явсан 🦋",
      desc: "Зоригтой алхам хийх цаг боллоо",
      preview: "😍🦋",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
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
      character: { ...WELCOME_BUTTERFLY },
      title: "Happy Valentine's Day 💕",
      subtitle: "Энэ онцгой зүйлийг чамдаа 💌",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Урилга нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      title: "Миний зүрхний захидал 💌",
      content:
        "Гэрэлт орчлонд Гэрэлтдэг чамдаа Гэгээн хайрын өдөр Гэнэтийн бэлэг барина би Чамин ганган хувцасаа өмсөөд Чи минь ирнэ Хайртай гэсэн үгээ Харамгүй хэлнэ чамдаа би  Хагацаж холдохгүй гэж амлая Хайртай гэсэн үгнээсээ няцахгүй гэж амлая.",
    },
    question: {
      character: null,
      text: "Энэ Valentine's Day-д хамт гарах уу? Чамтай хамт байхыг маш их хүсч байна... 🥺💕",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "🦋",
          date: "Анхны мөч",
          caption: "Чамайг анх харсан тэр мөч... ✨",
        },
        {
          type: "image",
          src: "",
          placeholder: "💕",
          date: "Зүрхний цохилт",
          caption: "Зүрх минь түргэсдэг... 💓",
        },
        {
          type: "image",
          src: "",
          placeholder: "😊",
          date: "Инээмсэглэл",
          caption: "Чиний инээмсэглэл намайг аз жаргалтай болгодог 🌸",
        },
        {
          type: "image",
          src: "",
          placeholder: "📱",
          date: "Мессеж",
          caption: "Чатлах бүрдээ инээмсэглэдэг 😊",
        },
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
            {
              emoji: "☕",
              name: "Кафе",
              desc: "Тайван яриа өрнүүлье",
              value: "Кафе",
            },
            { emoji: "🌸", name: "Парк", desc: "Алхаж ярилцъя", value: "Парк" },
            {
              emoji: "🎬",
              name: "Кино",
              desc: "Хамтдаа кино үзье",
              value: "Кино",
            },
            {
              emoji: "🍦",
              name: "Зайрмаг",
              desc: "Зайрмаг идэнгээ",
              value: "Зайрмаг",
            },
            {
              emoji: "📚",
              name: "Номын дэлгүүр",
              desc: "Номын дэлгүүр хэсье",
              value: "Номын дэлгүүр",
            },
            {
              emoji: "🎡",
              name: "Парк зугаалга",
              desc: "Зугаалгын газар",
              value: "Зугаалгын парк",
            },
          ],
        },
        {
          emoji: "💬",
          title: "Юу хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🗣️", name: "Ярилцах", value: "Ярилцана" },
            { emoji: "📸", name: "Зураг авах", value: "Зураг авна" },
            { emoji: "🎶", name: "Хөгжим сонсох", value: "Хөгжим сонсоно" },
            { emoji: "🍰", name: "Амттан идэх", value: "Амттан идэнэ" },
            { emoji: "🎮", name: "Тоглоом", value: "Тоглоом тоглоно" },
            { emoji: "🚶", name: "Алхах", value: "Хамтдаа алхана" },
          ],
        },
        {
          emoji: "⏰",
          title: "Хэдэн цагт?",
          key: "time",
          type: "time",
          multiSelect: false,
          options: [
            { label: "☀️ 13:00", value: "13:00" },
            { label: "🌤️ 15:00", value: "15:00" },
            { label: "🌅 17:00", value: "17:00" },
            { label: "🌙 19:00", value: "19:00" },
          ],
        },
        {
          emoji: "👗",
          title: "Хувцасны стиль",
          key: "outfit",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "✨", name: "Гоёхон", value: "Гоёхон" },
            { emoji: "👕", name: "Энгийн", value: "Энгийн" },
            { emoji: "🎀", name: "Cute", value: "Cute" },
            { emoji: "🤷", name: "Чи шийд 😉", value: "Чи шийдээрэй" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
        { key: "outfit", emoji: "👗", label: "Хувцасны хэв маяг" },
      ],
      quotes: [
        "Чамайг анх харсан тэр мөчөөс зүрх минь өөр хүнийхээ нэрээр цохилдог 💘",
        "Чиний инээмсэглэл бол миний өдрийн хамгийн гоё мөч 🦋",
        "Зоригтой байх нэг шалтгаан байна — чи 💕",
        "Crush гэдэг энэ мэдрэмж шиг гайхалтай зүйл байхгүй 😍",
      ],
    },
    effects: { ...DEFAULT_EFFECTS, stickers: STICKERS_LOVE },
  },

  {
    id: "crush-bold",
    category: "crush",
    customizer: null,
    card: {
      name: "Зоригтой мэдэгдэл 🔥",
      desc: "Шулуухан, зоригтой хэлбэрээр",
      preview: "🔥💘",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
    },
    theme: {
      className: "theme-crush-bold",
      colors: {
        "--t-primary": "#ff4757",
        "--t-secondary": "#ff3838",
        "--t-accent": "#ff6348",
        "--t-accent2": "#e84393",
        "--t-soft": "#fab1a0",
        "--t-light": "#ffeaa7",
        "--t-bg": "#1a0008",
        "--t-bg2": "#2d0012",
        "--t-glass": "rgba(255, 71, 87, 0.06)",
        "--t-glass-border": "rgba(255, 71, 87, 0.18)",
      },
    },
    welcome: {
      character: { ...WELCOME_FIRE },
      title: "Чамд шууд хэлье 🔥",
      subtitle: "Нууцалж байсаар залхлаа\nОдоо шулуухан хэлнэ 💪",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Урилга нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      title: "Зүрхнээсээ хэлэх нь 🔥",
      content:
        "Удаан бодож байгаад олддоггүй. Шулуухан хэлье — чи надад үнэхээр таалагддаг. Өдөр бүр чиний тухай бодож байгаа. Энэ Valentine's Day-р хамтдаа гоё цагийг өнгөрөөхгүй биз? 🔥❤️",
    },
    question: {
      character: null,
      text: "Чи надад таалагддаг. Valentine's Day-д хамтдаа байх уу? Миний хамт 🔥",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "🔥",
          date: "First sight",
          caption: "Анх чамайг харсан тэр мөч 🔥",
        },
        {
          type: "image",
          src: "",
          placeholder: "😊",
          date: "Хамтын мөч",
          caption: "Инээмсэглэл бүр зүрхийг шатаадаг ❤️‍🔥",
        },
        {
          type: "image",
          src: "",
          placeholder: "📱",
          date: "Chat",
          caption: "Бичсэн мессеж бүрт зүрх дүүрэн 💬",
        },
        {
          type: "image",
          src: "",
          placeholder: "⭐",
          date: "Ирээдүй",
          caption: "Ирээдүйд хамтдаа... 🌟",
        },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "🔥",
          title: "Хаана болзоо хийх вэ?",
          key: "place",
          type: "grid",
          multiSelect: false,
          options: [
            {
              emoji: "🍽️",
              name: "Ресторан",
              desc: "Гоё газар хоол идъе",
              value: "Ресторан",
            },
            {
              emoji: "🎬",
              name: "Кино",
              desc: "Сонирхолтой кино",
              value: "Кино",
            },
            {
              emoji: "🌃",
              name: "Шөнийн хот",
              desc: "Хотоор гарцгааё",
              value: "Шөнийн хот",
            },
            {
              emoji: "🎤",
              name: "Караоке",
              desc: "Хамтдаа дуулъя",
              value: "Караоке",
            },
            {
              emoji: "🎡",
              name: "Adventure",
              desc: "Адал явдалтай",
              value: "Adventure",
            },
            {
              emoji: "☕",
              name: "Кафе",
              desc: "Тайван ярьцгая",
              value: "Кафе",
            },
          ],
        },
        {
          emoji: "⚡",
          title: "Юу хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🍕", name: "Хоол идэх", value: "Хоол идэнгээ" },
            { emoji: "🎤", name: "Караоке", value: "Караоке дуулъя" },
            { emoji: "🎮", name: "Тоглоом", value: "Тоглоом" },
            { emoji: "🌃", name: "Зугаалах", value: "Зугаалъя" },
            { emoji: "📸", name: "Зураг авах", value: "Зураг авъя" },
            { emoji: "💃", name: "Бүжиглэх", value: "Бүжиглэнгээ" },
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
            { label: "🌆 18:00", value: "18:00" },
            { label: "🌙 19:00", value: "19:00" },
            { label: "✨ 20:00", value: "20:00" },
            { label: "🌃 21:00", value: "21:00" },
          ],
        },
        {
          emoji: "👗",
          title: "Яаж хувцаслах вэ?",
          key: "outfit",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "🔥", name: "Гоёмсог", value: "Гоёмсог" },
            { emoji: "😎", name: "Cool стиль", value: "Cool стиль" },
            { emoji: "👫", name: "Хос стиль", value: "Хос стиль" },
            { emoji: "🤫", name: "Сюрприз", value: "Сюрприз" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
        { key: "outfit", emoji: "👗", label: "Хувцасны хэв маяг" },
      ],
      quotes: [
        "Чи зүрхийг минь шатаадаг 🔥",
        "Юу ч нуухгүй — чамд дурлаж байна ❤️‍🔥",
        "Life is short, чамтай хамт байх хүсэл урт 💪",
        "Зоригтой байх шалтгаан — чи 🔥",
      ],
    },
    effects: { ...DEFAULT_EFFECTS, stickers: STICKERS_LOVE },
  },
];

// ═══════════════════════════════════════════════════════════════
// ШИНЭ ХОС TEMPLATES
// ═══════════════════════════════════════════════════════════════

const NEW_COUPLE_TEMPLATES = [
  {
    id: "spark",
    category: "new-couple",
    customizer: null,
    card: {
      name: "The Spark ✨",
      desc: "Invitation for new beginnings",
      preview: "✨💞",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
    },
    theme: {
      className: "theme-spark",
      colors: {
        "--t-primary": "#ff6bb5",
        "--t-secondary": "#a855f7",
        "--t-accent": "#ffd1dc",
        "--t-accent2": "#ff8fab",
        "--t-soft": "#ffc8dd",
        "--t-light": "#ffebf0",
        "--t-bg": "#120018",
        "--t-bg2": "#1a0025",
        "--t-glass": "rgba(255, 255, 255, 0.05)",
        "--t-glass-border": "rgba(255, 107, 181, 0.16)",
      },
    },
    welcome: {
      character: { ...WELCOME_CAT },
      title: "The Spark ✨",
      subtitle: "Invitation for new beginnings\nLet's make it special 💖",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Урилга нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      title: "For Our New Beginning ✨",
      content:
        'Чамтай хамт эхэлсэн энэ шинэ түүх миний хамгийн гоё мэдрэмж. Энэ Valentine\'s Day-д бид хоёрын "эхлэл" хамгийн романтик дурсамж болгоцгооё 💖',
    },
    question: {
      character: { ...QUESTION_CAT },
      text: "Be my Valentine? 💖",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "✨",
          date: "Эхлэл",
          caption: "Бидний шинэ эхлэл ✨",
        },
        {
          type: "image",
          src: "",
          placeholder: "💞",
          date: "Инээмсэглэл",
          caption: "Чиний инээмсэглэл 💖",
        },
        {
          type: "image",
          src: "",
          placeholder: "📸",
          date: "Дурсамж",
          caption: "Хамтдаа зураг авъя 📸",
        },
        {
          type: "image",
          src: "",
          placeholder: "🌸",
          date: "Мөч",
          caption: "Жижигхэн мөртлөө онцгой мөчүүд 🌸",
        },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "📍",
          title: "Хаана уулзах вэ?",
          key: "place",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "☕", name: "Кафе", desc: "Тайван яриа", value: "Кафе" },
            { emoji: "🎬", name: "Кино", desc: "Хамтдаа кино", value: "Кино" },
            { emoji: "🌸", name: "Парк", desc: "Алхаж ярилцъя", value: "Парк" },
            { emoji: "🍰", name: "Dessert", desc: "Амттан", value: "Dessert" },
            {
              emoji: "🍽️",
              name: "Ресторан",
              desc: "Оройн хоол",
              value: "Ресторан",
            },
            {
              emoji: "🏠",
              name: "Гэрийн date",
              desc: "Cozy",
              value: "Гэрийн date",
            },
          ],
        },
        {
          emoji: "🎯",
          title: "Юу хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🗣️", name: "Ярилцах", value: "Ярилцана" },
            { emoji: "📸", name: "Зураг авах", value: "Зураг авна" },
            { emoji: "🎶", name: "Дуу сонсох", value: "Дуу сонсоно" },
            { emoji: "🍫", name: "Амттан", value: "Амттан иднэ" },
            { emoji: "🎮", name: "Тоглоом", value: "Тоглоом тоглоно" },
            { emoji: "🚶", name: "Алхах", value: "Хамтдаа алхана" },
          ],
        },
        {
          emoji: "⏰",
          title: "Хэдэн цагт?",
          key: "time",
          type: "time",
          multiSelect: false,
          options: [
            { label: "☀️ 14:00", value: "14:00" },
            { label: "🌅 17:00", value: "17:00" },
            { label: "🌙 19:00", value: "19:00" },
            { label: "✨ 20:00", value: "20:00" },
          ],
        },
        {
          emoji: "👗",
          title: "Хувцасны стиль",
          key: "outfit",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "🎀", name: "Cute", value: "Cute" },
            { emoji: "✨", name: "Гялалзсан", value: "Гялалзсан" },
            { emoji: "👫", name: "Matching", value: "Matching" },
            { emoji: "🤍", name: "Энгийн", value: "Энгийн" },
          ],
        },
        {
          emoji: "🎁",
          title: "Бэлэг",
          key: "gift",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🌹", name: "Цэцэг", value: "Цэцэг" },
            { emoji: "🍫", name: "Шоколад", value: "Шоколад" },
            { emoji: "💌", name: "Захидал", value: "Захидал" },
            { emoji: "🧸", name: "Тоглоом", value: "Тоглоом" },
            { emoji: "🎀", name: "Accessory", value: "Accessory" },
            { emoji: "🎁", name: "Сюрприз", value: "Сюрприз" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
        { key: "outfit", emoji: "👗", label: "Хувцасны хэв маяг" },
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "New beginnings, same butterflies ✨",
        "Чи бол миний хамгийн гоё эхлэл 💖",
        "Энэ Valentine бидний хамгийн анхны онцгой дурсамж 💞",
        "Let's make some memories ✨",
      ],
    },
    effects: { ...DEFAULT_EFFECTS, stickers: STICKERS_CUTE },
  },

  {
    id: "new-sweet",
    category: "new-couple",
    customizer: null,
    card: {
      name: "Чихэрлэг эхлэл 🍬",
      desc: "Шинэ хайрын сайхан мөчүүд",
      preview: "🥰🍬",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
    },
    theme: {
      className: "theme-new-sweet",
      colors: {
        "--t-primary": "#ff8fab",
        "--t-secondary": "#fb6f92",
        "--t-accent": "#f093fb",
        "--t-accent2": "#a855f7",
        "--t-soft": "#ffc8dd",
        "--t-light": "#ffebf0",
        "--t-bg": "#150010",
        "--t-bg2": "#200018",
        "--t-glass": "rgba(255, 143, 171, 0.05)",
        "--t-glass-border": "rgba(255, 143, 171, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_CAT },
      title: "Миний чихэрлэг хайр 🍬",
      subtitle: "Бидний хамтын анхны Valentine's Day\nОнцгой болгоцгооё 💕",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Урилга нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      title: "Миний амттайхан 💌",
      content:
        "Чамтай үерхээд хэдхэн сар болсон ч өдөр бүр шинэ мэдрэмж нээдэг. Чи бол миний хайрын хамгийн амттай хэсэг. Анхны Valentine's Day маань мартагдашгүй байг! 🍬💕",
    },
    question: {
      character: { ...QUESTION_CAT },
      text: "Анхны Valentine's Day маань гоё байх нь ээ! Хамтдаа байх уу бэйби? 🥰",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "🥰",
          date: "Эхний date",
          caption: "Анхны болзоо маш сайхан байсан 💕",
        },
        {
          type: "image",
          src: "",
          placeholder: "🤳",
          date: "Selfie",
          caption: "Анхны хос зураг 📸",
        },
        {
          type: "image",
          src: "",
          placeholder: "💕",
          date: "Хамтын мөч",
          caption: "Чамтай хамт байхад сэтгэл жаргалтай 🥰",
        },
        {
          type: "image",
          src: "",
          placeholder: "🎉",
          date: "Тэмдэглэл",
          caption: "Бидний анхны онцгой мөч ✨",
        },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "🧁",
          title: "Хаана date хийх вэ?",
          key: "place",
          type: "grid",
          multiSelect: true,
          options: [
            {
              emoji: "🍰",
              name: "Bakery & Кафе",
              desc: "Амттай зүйл идье",
              value: "Bakery & Кафе",
            },
            {
              emoji: "🍽️",
              name: "Ресторан",
              desc: "Романтик оройн хоол",
              value: "Ресторан",
            },
            { emoji: "🎬", name: "Кино", desc: "Романтик кино", value: "Кино" },
            {
              emoji: "🏠",
              name: "Гэрийн date",
              desc: "Netflix & chill",
              value: "Гэрийн date",
            },
            {
              emoji: "🛍️",
              name: "Shopping",
              desc: "Хамтдаа дэлгүүр",
              value: "Shopping",
            },
            {
              emoji: "🎡",
              name: "Парк",
              desc: "Зугаалгын газар",
              value: "Зугаалгын парк",
            },
          ],
        },
        {
          emoji: "💕",
          title: "Юу хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "📸", name: "Couple photo", value: "Couple зураг авна" },
            { emoji: "🧁", name: "Bake хийх", value: "Хамтдаа bake хийнэ" },
            { emoji: "🎥", name: "Кино үзэх", value: "Кино үзнэ" },
            { emoji: "💃", name: "Бүжиглэх", value: "Бүжиглэнэ" },
            { emoji: "🎤", name: "Караоке", value: "Караоке дуулна" },
            { emoji: "🎮", name: "Тоглоом", value: "Тоглоом тоглоно" },
          ],
        },
        {
          emoji: "⏰",
          title: "Хэдэн цагт уулзах вэ?",
          key: "time",
          type: "time",
          multiSelect: false,
          options: [
            { label: "🌸 12:00", value: "12:00" },
            { label: "☀️ 14:00", value: "14:00" },
            { label: "🌅 17:00", value: "17:00" },
            { label: "🌙 19:00", value: "19:00" },
            { label: "✨ 20:00", value: "20:00" },
          ],
        },
        {
          emoji: "👗",
          title: "Хувцасны стиль",
          key: "outfit",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "🌸", name: "Cute & Pink", value: "Cute & Pink" },
            { emoji: "👫", name: "Matching outfit", value: "Matching outfit" },
            { emoji: "✨", name: "Гялалзсан", value: "Гялалзсан" },
            { emoji: "🎀", name: "Сюрприз!", value: "Сюрприз" },
          ],
        },
        {
          emoji: "🎁",
          title: "Бэлэг юу авах вэ?",
          key: "gift",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🌹", name: "Цэцэг", value: "Цэцэг" },
            { emoji: "🍫", name: "Шоколад", value: "Шоколад" },
            { emoji: "🧸", name: "Тоглоом", value: "Тоглоом" },
            { emoji: "💌", name: "Захидал", value: "Захидал" },
            { emoji: "📸", name: "Couple зураг", value: "Couple зураг" },
            { emoji: "🎁", name: "Сюрприз", value: "Сюрприз бэлэг" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
        { key: "outfit", emoji: "👗", label: "Хувцасны хэв маяг" },
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "Чамтай нэг нэг өдрийг илүүд үзнэ хэн нэгнийг бүхэлд нь 💕",
        "Шинэ хайр шиг сайхан зүйл байхгүй 🥰",
        "Чамтай хамт байх цаг бүр шинэ адал явдал 🍬",
        "Миний зүрхний эзэн чи л гэдгийг чи мэдэх үү? 💖",
      ],
    },
    effects: { ...DEFAULT_EFFECTS, stickers: STICKERS_CUTE },
  },
];

// ═══════════════════════════════════════════════════════════════
// УДААН ХОС TEMPLATES
// ═══════════════════════════════════════════════════════════════

const LONG_TERM_TEMPLATES = [
  {
    id: "classic",
    category: "long-term",
    customizer: null,
    card: {
      name: "Сонгодог Романтик 💕",
      desc: "Уламжлалт ягаан, зүрхэн дизайн",
      preview: "🐻💝",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
    },
    theme: {
      className: "theme-classic",
      colors: {
        "--t-primary": "#ff6b9d",
        "--t-secondary": "#ff4081",
        "--t-accent": "#c471ed",
        "--t-accent2": "#7c4dff",
        "--t-soft": "#ff9a9e",
        "--t-light": "#ffd1dc",
        "--t-bg": "#0d0015",
        "--t-bg2": "#1a0025",
        "--t-glass": "rgba(255, 255, 255, 0.04)",
        "--t-glass-border": "rgba(255, 100, 150, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_BEAR },
      title: "Happy Valentine's Day 💕",
      subtitle: "Хамгийн хайртай хүндээ зориулсан\nтусгай урилга ❤️",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Урилга нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      title: "Хайр минь 💕",
      content:
        "Олон жил хамт байсан ч чамд дурлах сэтгэл маань анхны өдрийнхөө адил хүчтэй. Чамтай хамт байсан жил бүр миний амьдралын хамгийн гоё хуудас. Хайр минь, энэ Valentine's Day маань ч гэсэн онцгой байг 💝",
    },
    question: {
      character: { ...QUESTION_BEAR },
      text: "2.14-нд хамтдаа гоё байж болон шдээ Чи надтай гал халуун шөнийг өнгөрөөх үү? 🥺",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "📸",
          date: "Эхний уулзалт",
          caption: "Анх уулзсан тэр мөч... ✨",
        },
        {
          type: "image",
          src: "",
          placeholder: "🎂",
          date: "Төрсөн өдөр",
          caption: "Чамтай хамт тэмдэглэсэн анхны төрсөн өдөр 😊🎉",
        },
        {
          type: "video",
          src: "",
          placeholder: "🎥",
          date: "Дурсамж",
          caption: "Хамтдаа хийж байсан тэр мөч 😊",
        },
        {
          type: "image",
          src: "",
          placeholder: "🌅",
          date: "Аялал",
          caption: "Нар жаргахыг хамтдаа харцгааья  🌇",
        },
        {
          type: "image",
          src: "",
          placeholder: "💕",
          date: "Онцгой мөч",
          caption: "Чамтай байх мөч бүр онцгой 💖",
        },
        {
          type: "video",
          src: "",
          placeholder: "🎬",
          date: "Бидний видео",
          caption: "Бид хоёрын мартагдашгүй мөч 🥰",
        },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "📍",
          title: "Хаана хийх вэ?",
          key: "place",
          type: "grid",
          multiSelect: true,
          options: [
            {
              emoji: "🍽️",
              name: "Ресторан",
              desc: "Романтик оройн хоол",
              value: "Ресторан",
            },
            {
              emoji: "☕",
              name: "Кафе",
              desc: "Дулаахан уур амьсгал",
              value: "Кафе",
            },
            {
              emoji: "🎬",
              name: "Кино театр",
              desc: "Хамтдаа кино үзье",
              value: "Кино театр",
            },
            {
              emoji: "🏠",
              name: "Гэрээр",
              desc: "Хамтдаа хоол хийе",
              value: "Гэрээр",
            },
            {
              emoji: "🌃",
              name: "Шөнийн хот",
              desc: "Хотоор зугаалъя",
              value: "Шөнийн хот",
            },
            {
              emoji: "🏔️",
              name: "Байгаль",
              desc: "Байгалийн үзэсгэлэн",
              value: "Байгаль",
            },
          ],
        },
        {
          emoji: "🎯",
          title: "Яаж хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🍕", name: "Хоол идэх", value: "Хоол идэнгээ" },
            { emoji: "🚶‍♂️", name: "Алхах", value: "Алхангаа" },
            { emoji: "🎥", name: "Кино үзэх", value: "Кино үзэнгээ" },
            { emoji: "🎮", name: "Тоглоом", value: "Тоглонгоо" },
            { emoji: "💃", name: "Бүжиглэх", value: "Бүжиглэнгээ" },
            { emoji: "🎤", name: "Караоке", value: "Караоке хийж" },
          ],
        },
        {
          emoji: "⏰",
          title: "Хэдэн цаг хийх вэ?",
          key: "time",
          type: "time",
          multiSelect: false,
          options: [
            { label: "🌤️ 12:00", value: "12:00" },
            { label: "☀️ 14:00", value: "14:00" },
            { label: "🌅 17:00", value: "17:00" },
            { label: "🌙 19:00", value: "19:00" },
            { label: "✨ 20:00", value: "20:00" },
            { label: "🌃 21:00", value: "21:00" },
          ],
        },
        {
          emoji: "👗",
          title: "Хувцасны хэв маяг",
          key: "outfit",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "👔", name: "Гоёмсог", value: "Гоёмсог" },
            { emoji: "👕", name: "Энгийн тохилог", value: "Энгийн тохилог" },
            { emoji: "👫", name: "Хос хувцас", value: "Хос хувцас" },
            { emoji: "🎁", name: "Сюрприз!", value: "Сюрприз" },
          ],
        },
        {
          emoji: "🎁",
          title: "Бэлэг юу авах вэ?",
          key: "gift",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🌹", name: "Цэцэг", value: "Цэцэг" },
            { emoji: "🍫", name: "Шоколад", value: "Шоколад" },
            { emoji: "💍", name: "Зүүлт", value: "Зүүлт" },
            { emoji: "🧸", name: "Тоглоом баавгай", value: "Тоглоом баавгай" },
            { emoji: "💌", name: "Захидал", value: "Захидал" },
            { emoji: "🎁", name: "Сюрприз", value: "Сюрприз бэлэг" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
        { key: "outfit", emoji: "👗", label: "Хувцасны хэв маяг" },
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "Чамтай хамт байх мөч бүр миний амьдралын хамгийн үнэт мөчүүд 💕",
        "Хайр гэдэг чамтай хамт амьдрах мөрөөдөл 🌙",
        "Чи бол миний бүх зүйл 💝",
        "Зүрхний цохилт бүр чиний нэрээр цохилдог ❤️",
      ],
    },
    effects: { ...DEFAULT_EFFECTS, stickers: STICKERS_NATURE },
  },

  {
    id: "starry",
    category: "long-term",
    customizer: null,
    card: {
      name: "Одот Шөнө 🌙",
      desc: "Шөнийн тэнгэр, од, сар",
      preview: "🌙⭐",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
    },
    theme: {
      className: "theme-starry",
      colors: {
        "--t-primary": "#7eb8da",
        "--t-secondary": "#5b9bd5",
        "--t-accent": "#ffd700",
        "--t-accent2": "#b8860b",
        "--t-soft": "#a3c9e2",
        "--t-light": "#e6f0fa",
        "--t-bg": "#070b1a",
        "--t-bg2": "#0f1630",
        "--t-glass": "rgba(120, 160, 220, 0.06)",
        "--t-glass-border": "rgba(120, 160, 220, 0.18)",
      },
    },
    welcome: {
      character: { ...WELCOME_MOON },
      title: "Одот шөнийн урилга ⭐",
      subtitle: "Мянга мянган одны дундаас\nчамайг олсон миний аз ✨",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Урилга нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      title: "Одтой шөнийн захидал 🌙",
      content:
        "Тэнгэрт мянган од бялхаж байвч чамаас өөр од миний нүдэнд харагддаггүй. Бид хамт одтой шөнийг тоолсон жилүүд бол миний хамгийн гоё дурсамж. Хайр минь, энэ шөнө ч мөн чамд зориулав ⭐💙",
    },
    question: {
      character: { ...QUESTION_MOON },
      text: "Энэ Valentine's Day-д одтой шөнийг хамтдаа өнгөрөөх үү? 🌙",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "🌙",
          date: "Эхний шөнө",
          caption: "Хамтдаа одтой тэнгэр харсан шөнө ✨",
        },
        {
          type: "image",
          src: "",
          placeholder: "⭐",
          date: "Онцгой мөч",
          caption: "Чи бол миний од 🌟",
        },
        {
          type: "video",
          src: "",
          placeholder: "🎥",
          date: "Дурсамж",
          caption: "Бидний хамтын мөчүүд 🌙",
        },
        {
          type: "image",
          src: "",
          placeholder: "🌌",
          date: "Аялал",
          caption: "Шөнийн тэнгэрийн доор хамтдаа 💫",
        },
        {
          type: "image",
          src: "",
          placeholder: "💫",
          date: "Wish",
          caption: "Одонд хүсэл тавьсан тэр шөнө 🌠",
        },
        {
          type: "video",
          src: "",
          placeholder: "🎬",
          date: "Бидний видео",
          caption: "Together under the stars 🥰",
        },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "🌃",
          title: "Хаана уулзах вэ?",
          key: "place",
          type: "grid",
          multiSelect: true,
          options: [
            {
              emoji: "🌉",
              name: "Гүүрэн дээр",
              desc: "Одтой шөнө, гоё view",
              value: "Гүүрэн дээр",
            },
            {
              emoji: "🍽️",
              name: "Rooftop ресторан",
              desc: "Дээвэр дээрх оройн хоол",
              value: "Rooftop ресторан",
            },
            {
              emoji: "🏕️",
              name: "Гадаа camping",
              desc: "Одтой тэнгэрийн доор",
              value: "Camping",
            },
            {
              emoji: "🏠",
              name: "Гэрээр",
              desc: "Дулаахан гэрт хамтдаа",
              value: "Гэрээр",
            },
            {
              emoji: "🌳",
              name: "Парк",
              desc: "Шөнийн паркаар алхъя",
              value: "Парк",
            },
            {
              emoji: "🚗",
              name: "Drive",
              desc: "Шөнийн drive хийе",
              value: "Drive",
            },
          ],
        },
        {
          emoji: "✨",
          title: "Юу хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🔭", name: "Од харах", value: "Од харанаа" },
            { emoji: "🕯️", name: "Лааны гэрэл", value: "Лааны гэрэлд" },
            { emoji: "🎶", name: "Хөгжим сонсох", value: "Хөгжим сонсоно" },
            { emoji: "🍷", name: "Wine уух", value: "Wine ууна" },
            { emoji: "🌌", name: "Зураг авах", value: "Зураг авна" },
            { emoji: "💫", name: "Wish хийх", value: "Wish хийнэ" },
          ],
        },
        {
          emoji: "🕐",
          title: "Хэдэн цагт?",
          key: "time",
          type: "time",
          multiSelect: false,
          options: [
            { label: "🌅 18:00", value: "18:00" },
            { label: "🌆 19:00", value: "19:00" },
            { label: "🌙 20:00", value: "20:00" },
            { label: "✨ 21:00", value: "21:00" },
            { label: "🌌 22:00", value: "22:00" },
            { label: "🌃 23:00", value: "23:00" },
          ],
        },
        {
          emoji: "🧥",
          title: "Хувцасны стиль",
          key: "outfit",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "🖤", name: "All Black", value: "All Black" },
            { emoji: "✨", name: "Гялалзсан", value: "Гялалзсан" },
            { emoji: "🧣", name: "Дулаахан cozy", value: "Дулаахан cozy" },
            { emoji: "🌟", name: "Сюрприз!", value: "Сюрприз" },
          ],
        },
        {
          emoji: "🎁",
          title: "Бэлгийн санаа",
          key: "gift",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "⭐", name: "Одны зураг", value: "Одны зураг" },
            { emoji: "🌹", name: "Цэцэг", value: "Цэцэг" },
            { emoji: "📓", name: "Дурсамжын ном", value: "Дурсамжын ном" },
            { emoji: "🎵", name: "Playlist", value: "Playlist" },
            { emoji: "💫", name: "Зүүлт", value: "Зүүлт" },
            { emoji: "🎁", name: "Сюрприз", value: "Сюрприз бэлэг" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
        { key: "outfit", emoji: "👗", label: "Хувцасны хэв маяг" },
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "Тэнгэрт мянган од байвч чи бол миний цорын ганц од ⭐",
        "Шөнийн тэнгэр доор чамтай хамт байхаас илүү зүйл байхгүй 🌙",
        "Чи бол миний шөнийн гэрэл, миний сар 🌟",
        "Одод унахдаа хүслээ биелүүлдэг, чи бол миний биелсэн хүсэл 💫",
      ],
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: [
        "⭐",
        "✨",
        "💫",
        "🌟",
        "💝",
        "💕",
        "🌙",
        "💖",
        "💗",
        "💞",
      ],
      heartRain: ["⭐", "✨", "💫", "🌟", "💝", "💕", "🌙", "🤍", "💜"],
      stickers: STICKERS_NATURE,
    },
  },

  {
    id: "candy",
    category: "long-term",
    customizer: null,
    card: {
      name: "Чихэрлэг Хайр 🍬",
      desc: "Pastel, kawaii, cute стиль",
      preview: "🐱🍭",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
    },
    theme: {
      className: "theme-candy",
      colors: {
        "--t-primary": "#ff8fab",
        "--t-secondary": "#fb6f92",
        "--t-accent": "#a855f7",
        "--t-accent2": "#06d6a0",
        "--t-soft": "#ffc8dd",
        "--t-light": "#ffebf0",
        "--t-bg": "#1a0a1e",
        "--t-bg2": "#230f28",
        "--t-glass": "rgba(255, 143, 171, 0.06)",
        "--t-glass-border": "rgba(255, 143, 171, 0.18)",
      },
    },
    welcome: {
      character: { ...WELCOME_CAT },
      title: "Sweet Valentine 🍭",
      subtitle: "Амттай хайрын урилга\nЧамд зориулав 🧁",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Урилга нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      title: "Миний чихэрлэг хайр 🍬",
      content:
        "Чамтай хамт байх бүр амьдрал бялуу шиг амттай. Өдөр бүр чамтай хамт байхдаа шоколад шиг аз жаргалтай байдаг. Чи бол миний хамгийн гоё амт 🧁💕",
    },
    question: {
      character: { ...QUESTION_CAT },
      text: "Valentine's Day-д хамтдаа амтархах уу? Чи миний чихэрлэг хайр! 🍬🥺",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "🍬",
          date: "Эхний уулзалт",
          caption: "Анхны чихэрлэг мөч 🧁",
        },
        {
          type: "image",
          src: "",
          placeholder: "🎀",
          date: "Төрсөн өдөр",
          caption: "Чамтай хамт тэмдэглэсэн тэр өдөр 🎂",
        },
        {
          type: "video",
          src: "",
          placeholder: "🎥",
          date: "Дурсамж",
          caption: "Инээж байсан тэр мөч 😆",
        },
        {
          type: "image",
          src: "",
          placeholder: "🌸",
          date: "Date",
          caption: "Хамтдаа зугаалсан тэр өдөр 💕",
        },
        {
          type: "image",
          src: "",
          placeholder: "🧸",
          date: "Cute мөч",
          caption: "Чи бол миний хамгийн cute хүн 🥰",
        },
        {
          type: "video",
          src: "",
          placeholder: "🎬",
          date: "Бидний видео",
          caption: "Sweet moments together 🍭",
        },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "🧁",
          title: "Хаана амтархах вэ?",
          key: "place",
          type: "grid",
          multiSelect: true,
          options: [
            {
              emoji: "🍰",
              name: "Bakery",
              desc: "Бялуу амтлая",
              value: "Bakery",
            },
            {
              emoji: "🍦",
              name: "Ice cream",
              desc: "Зайрмаг идъе",
              value: "Ice cream",
            },
            {
              emoji: "🧋",
              name: "Bubble tea",
              desc: "Bubble tea ууя",
              value: "Bubble tea",
            },
            {
              emoji: "🏠",
              name: "Гэрээр",
              desc: "Хамтдаа bake хийе",
              value: "Гэрээр",
            },
            {
              emoji: "🎡",
              name: "Парк",
              desc: "Зугаалгын парк",
              value: "Зугаалгын парк",
            },
            {
              emoji: "🛍️",
              name: "Shopping",
              desc: "Дэлгүүр хэсье",
              value: "Shopping",
            },
          ],
        },
        {
          emoji: "🎀",
          title: "Юу хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🧁", name: "Bake хийх", value: "Bake хийнэ" },
            { emoji: "🎨", name: "Зурах", value: "Хамтдаа зурна" },
            { emoji: "📸", name: "Photoshoot", value: "Photoshoot" },
            { emoji: "🎮", name: "Тоглоом", value: "Тоглонгоо" },
            { emoji: "🎤", name: "Караоке", value: "Караоке" },
            { emoji: "🎥", name: "Anime үзэх", value: "Anime үзнэ" },
          ],
        },
        {
          emoji: "⏰",
          title: "Хэдэн цагт?",
          key: "time",
          type: "time",
          multiSelect: false,
          options: [
            { label: "🌸 11:00", value: "11:00" },
            { label: "☀️ 13:00", value: "13:00" },
            { label: "🍰 15:00", value: "15:00" },
            { label: "🌅 17:00", value: "17:00" },
            { label: "🍬 19:00", value: "19:00" },
            { label: "✨ 20:00", value: "20:00" },
          ],
        },
        {
          emoji: "👗",
          title: "Хувцасны стиль",
          key: "outfit",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "🌸", name: "Cute & Pink", value: "Cute & Pink" },
            { emoji: "🧸", name: "Cozy hoodie", value: "Cozy hoodie" },
            { emoji: "👫", name: "Matching outfit", value: "Matching outfit" },
            { emoji: "🎀", name: "Сюрприз!", value: "Сюрприз" },
          ],
        },
        {
          emoji: "🎁",
          title: "Бэлэг юу авах вэ?",
          key: "gift",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🍫", name: "Шоколад", value: "Шоколад" },
            { emoji: "🧸", name: "Тоглоом", value: "Тоглоом" },
            { emoji: "🌸", name: "Цэцэг", value: "Цэцэг" },
            { emoji: "🎀", name: "Гоёл чимэглэл", value: "Гоёл чимэглэл" },
            { emoji: "🧁", name: "Бялуу", value: "Бялуу" },
            { emoji: "🎁", name: "Сюрприз", value: "Сюрприз бэлэг" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
        { key: "outfit", emoji: "👗", label: "Хувцасны хэв маяг" },
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "Чи бол миний амьдралын хамгийн амттай хэсэг 🍬",
        "Өдөр бүр чамтай хамт шоколад шиг амттай 🍫",
        "Чи бол миний хамгийн cute хүн, хэзээ ч солигдохгүй 🧸",
        "Хайр гэдэг чамтай хамт инээх тэр мөч 💖",
      ],
    },
    effects: { ...DEFAULT_EFFECTS, stickers: STICKERS_NATURE },
  },
];

// ═══════════════════════════════════════════════════════════════
// Y2K / 2000s TEMPLATES
// ═══════════════════════════════════════════════════════════════

const Y2K_TEMPLATES = [
  {
    id: "y2k-retro",
    category: "y2k",
    customizer: null,
    card: {
      name: "Y2K Retro Love 📟",
      desc: "2000 оны ностальги стиль",
      preview: "📟💿",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
    },
    theme: {
      className: "theme-y2k",
      colors: {
        "--t-primary": "#00d4ff",
        "--t-secondary": "#ff00e5",
        "--t-accent": "#39ff14",
        "--t-accent2": "#ffff00",
        "--t-soft": "#b4f0ff",
        "--t-light": "#ffe6fb",
        "--t-bg": "#050510",
        "--t-bg2": "#0a0a20",
        "--t-glass": "rgba(0, 212, 255, 0.05)",
        "--t-glass-border": "rgba(0, 212, 255, 0.18)",
      },
    },
    welcome: {
      character: { ...WELCOME_RETRO },
      title: "Y2K Valentine 💿",
      subtitle: "2000 оны стилиар хайраа илэрхийлье\nRetro love never dies 🦋",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Урилга нээх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      title: "E-mail from my heart 📧",
      content:
        'Subject: I ❤️ U\n\nHi babe! 🦋\n\nЧамд захидал бичих гэж хөгжимттэй MySpace маань нээгээд суулаа... Чи бол миний AIM buddy list-ийн #1. Nokia-гоороо "I miss u" гэж бичих бүрт зүрх минь MSN Messenger-ийн nudge шиг чичирдэг... 📟💕\n\nBe my Valentine? Y/N\n\nxoxo 💋',
    },
    question: {
      character: null,
      text: "AOL-оос чат ирлээ шүү 📧 Be my Valentine? Ctrl+❤️ дар! 💾",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "📟",
          date: "First beep",
          caption: "Анхны пэйжер мессеж 📟💕",
        },
        {
          type: "image",
          src: "",
          placeholder: "💿",
          date: "Mix tape",
          caption: "Чамд зориулсан Mix CD 🎵",
        },
        {
          type: "image",
          src: "",
          placeholder: "📸",
          date: "Polaroid",
          caption: "Photo booth дурсамж ✨",
        },
        {
          type: "image",
          src: "",
          placeholder: "🦋",
          date: "2000s vibes",
          caption: "Butterfly clips & frosted tips 🦋",
        },
        {
          type: "video",
          src: "",
          placeholder: "📺",
          date: "Movie night",
          caption: "DVD movie night хамтдаа 🎬",
        },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "💿",
          title: "Хаана hangout хийх вэ?",
          key: "place",
          type: "grid",
          multiSelect: true,
          options: [
            {
              emoji: "🎧",
              name: "CD дэлгүүр",
              desc: "Хөгжимийн дэлгүүр хэсье",
              value: "CD дэлгүүр",
            },
            {
              emoji: "🎬",
              name: "Blockbuster кино",
              desc: "2000s кино үзье",
              value: "Кино",
            },
            {
              emoji: "🛼",
              name: "Roller skating",
              desc: "Дугуйтай тэшүүр",
              value: "Roller skating",
            },
            {
              emoji: "🍔",
              name: "Diner",
              desc: "Retro хоолны газар",
              value: "Diner",
            },
            {
              emoji: "🎮",
              name: "Arcade",
              desc: "Тоглоомын газар",
              value: "Arcade",
            },
            {
              emoji: "🏠",
              name: "Гэрээр",
              desc: "DVD movie night",
              value: "DVD night",
            },
          ],
        },
        {
          emoji: "📀",
          title: "Юу хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🎵", name: "Mix CD хийх", value: "Mix CD хийнэ" },
            { emoji: "📸", name: "Photo booth", value: "Photo booth" },
            { emoji: "🎮", name: "Retro тоглоом", value: "Retro тоглоом" },
            { emoji: "💌", name: "Гар захидал", value: "Гар захидал бичнэ" },
            { emoji: "📞", name: "Long call", value: "Удаан утасдана" },
            { emoji: "🛼", name: "Skating", value: "Тэшүүр тэшнэ" },
          ],
        },
        {
          emoji: "⏰",
          title: "Хэдэн цагт?",
          key: "time",
          type: "time",
          multiSelect: false,
          options: [
            { label: "📺 14:00", value: "14:00" },
            { label: "🌅 16:00", value: "16:00" },
            { label: "🌆 18:00", value: "18:00" },
            { label: "📟 20:00", value: "20:00" },
            { label: "🌙 22:00", value: "22:00" },
          ],
        },
        {
          emoji: "👗",
          title: "Y2K Style",
          key: "outfit",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "🦋", name: "Y2K Glam", value: "Y2K Glam" },
            {
              emoji: "👖",
              name: "Low-rise & crop",
              value: "Low-rise & crop top",
            },
            { emoji: "🧢", name: "Sporty", value: "Sporty" },
            { emoji: "💿", name: "Сюрприз!", value: "Сюрприз" },
          ],
        },
        {
          emoji: "🎁",
          title: "Бэлэг",
          key: "gift",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "💿", name: "Mix CD", value: "Mix CD" },
            { emoji: "📸", name: "Polaroid зураг", value: "Polaroid зураг" },
            { emoji: "📝", name: "Гар захидал", value: "Гар захидал" },
            { emoji: "🧸", name: "Тоглоом баавгай", value: "Тоглоом баавгай" },
            { emoji: "🦋", name: "Butterfly зүүлт", value: "Butterfly зүүлт" },
            { emoji: "🎁", name: "Сюрприз", value: "Сюрприз бэлэг" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
        { key: "outfit", emoji: "👗", label: "Хувцасны хэв маяг" },
        { key: "gift", emoji: "🎁", label: "Бэлэг" },
      ],
      quotes: [
        "U R the 1 4 me, чамайг хайрлаж байна 4ever 📟💕",
        "MSN-д online гарахыг чинь хүлээдэг шиг чамайг хүлээнэ 💻",
        "Retro хайр бидний хайр шиг хэзээ ч хуучрахгүй 💿",
        "Чамд зориулсан Mix CD дээр бүх дуу хайрын дуу 🎵",
      ],
    },
    effects: {
      ...DEFAULT_EFFECTS,
      clickSparkles: ["✨", "💿", "🦋", "⭐"],
      stickers: STICKERS_RETRO,
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// ХОЛЫН ХАЙР / LONG-DISTANCE TEMPLATES
// ═══════════════════════════════════════════════════════════════

const LONG_DISTANCE_TEMPLATES = [
  // ─── Theme 1: Sunset Galaxy ───
  {
    id: "ld-sunset-galaxy",
    category: "long-distance",
    customizer: null,
    card: {
      name: "Нарны жаргалт 🌅",
      desc: "Хол байсан ч нэг нарыг хардаг",
      preview: "🌅✈️",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
    },
    theme: {
      className: "theme-ld-sunset",
      colors: {
        "--t-primary": "#ff6b6b",
        "--t-secondary": "#ee5a24",
        "--t-accent": "#f9ca24",
        "--t-accent2": "#ff9ff3",
        "--t-soft": "#ffcccc",
        "--t-light": "#fff3e0",
        "--t-bg": "#1a0a0a",
        "--t-bg2": "#2d1010",
        "--t-glass": "rgba(255, 107, 107, 0.05)",
        "--t-glass-border": "rgba(255, 107, 107, 0.15)",
      },
    },
    welcome: {
      character: { ...WELCOME_PLANE },
      title: "Гэгээн Валентины мэнд! 💕",
      subtitle: "2.14 — Хол байсан ч зүрх ойрхон\nЭнэ урилга чамд 💌",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Үргэлжлүүлэх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      envelope: { emoji: "💌", text: "Захиа ирлээ...", sparkleEmoji: "✨" },
      title: "Сэтгэлийн үгс 💌",
      content:
        "Удаан бодох байгаад олддоггүй. Шулуухан хэлье — чи надад үнэхээр таалагддаг. Өдөр бүр чиний тухай бодож байгаа. Энэ Valentine's Day-р хамтдаа гоё цагийг өнгөрөөхгүй биз? 🔥❤️\n\nБидний ярих хэзээ ч дусддаггүй — чарлан уг дуулахийхнь оронд бч хамтдаа аз жаргалтай ёнгөрөөхгүй биз? 🌅💕\n\nЗүрхнээсээ хэлэх нь 🔥",
      music: {
        url: "https://youtu.be/Ri3WsPDi4MY?si=izm75BPjlQSKNCBk",
        title: "🎵 Romantic Music",
        duration: 240,
      },
    },
    question: {
      character: { ...QUESTION_PLANE },
      quizMode: true,
      quizQuestions: [
        {
          text: "Би чамайг өдөрт хэдэн удаа боддог вэ?",
          options: [
            { emoji: "1️⃣", name: "Нэг удаа", value: "Нэг удаа" },
            { emoji: "🔢", name: "10 удаа", value: "10 удаа" },
            { emoji: "💯", name: "100 удаа", value: "100 удаа" },
            { emoji: "♾️", name: "Тоолж баршгүй", value: "Тоолж баршгүй" },
          ],
          correctIndex: 0,
          correctText: "Зөв! Нэг ч удаа зогсдоггүй — чамайг ҮРГЭЛЖ боддог 💕",
        },
        {
          text: "Чиний юунд таалагддаг гэж бодож байна?",
          options: [
            { emoji: "😊", name: "Инээмсэглэл", value: "Инээмсэглэл" },
            { emoji: "💎", name: "Зан чанар", value: "Зан чанар" },
            { emoji: "👀", name: "Нүд", value: "Нүд" },
            { emoji: "💖", name: "Бүх зүйл", value: "Бүх зүйл" },
          ],
          correctIndex: 3,
          correctText: "Зөв! Би чиний бүх зүйлд хайртай 💖",
        },
        {
          text: "Би чамд хайртай болоод хэдэн жил болсон бэ?",
          options: [
            { emoji: "1️⃣", name: "1 жил", value: "1 жил" },
            { emoji: "2️⃣", name: "2 жил", value: "2 жил" },
            { emoji: "3️⃣", name: "3 жил", value: "3 жил" },
            { emoji: "♾️", name: "Мөнхөд", value: "Мөнхөд" },
          ],
          correctIndex: 1,
          correctText: "Зөв! 2 жилийн хайр, мөнхөд үргэлжлэх болно 💕",
        },
        {
          text: "Бид хоёрын хамгийн гоё дурсамж юу вэ?",
          multiSelect: true,
          allowOther: true,
          options: [
            { emoji: "✈️", name: "Анх уулзсан", value: "Анх уулзсан" },
            { emoji: "📱", name: "Шөнийн ярианууд", value: "Шөнийн ярианууд" },
            { emoji: "🎁", name: "Бэлэг өгсөн", value: "Бэлэг өгсөн" },
            { emoji: "🌅", name: "Хамтдаа аялсан", value: "Хамтдаа аялсан" },
            { emoji: "😂", name: "Хамт инээсэн", value: "Хамт инээсэн" },
          ],
        },
        {
          text: "Бид хоёрын хайр ямар юмтай адил вэ?",
          multiSelect: true,
          allowOther: true,
          options: [
            { emoji: "🌊", name: "Далай шиг гүн", value: "Далай шиг гүн" },
            { emoji: "⭐", name: "Од шиг гэрэлтэй", value: "Од шиг гэрэлтэй" },
            { emoji: "🔥", name: "Гал шиг халуун", value: "Гал шиг халуун" },
            { emoji: "🌸", name: "Цэцэг шиг гоё", value: "Цэцэг шиг гоё" },
            { emoji: "💎", name: "Алмаз шиг мөнхийн", value: "Алмаз шиг мөнхийн" },
          ],
        },
        {
          text: "Дараа уулзахдаа юу хийх вэ?",
          multiSelect: true,
          allowOther: true,
          options: [
            { emoji: "🤗", name: "Тэврэх", value: "Тэврэх" },
            { emoji: "😘", name: "Үнсэх", value: "Үнсэх" },
            { emoji: "🍽️", name: "Хамтдаа хоол идэх", value: "Хамтдаа хоол идэх" },
            { emoji: "🎬", name: "Кино үзэх", value: "Кино үзэх" },
            { emoji: "📸", name: "Зураг авах", value: "Зураг авах" },
          ],
        },
      ],
      text: "Би чиний юунд илүү дуртай вэ?",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerTitle: "Бидний дурсамжууд",
      continueButton: "Асуултууд 💕",
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "🌅",
          date: "Нарны жаргалт",
          caption: "Нэг нарыг харж байсан тэр мөч... 🌅",
        },
        {
          type: "image",
          src: "",
          placeholder: "✈️",
          date: "Нисэх өдөр",
          caption: "Чам руу нисэх тэр өдөр 💕",
        },
        {
          type: "image",
          src: "",
          placeholder: "📱",
          date: "Видео дуудлага",
          caption: "Дэлгэцээр ч гэсэн чиний нүүрийг харах аз жаргал 🥰",
        },
        {
          type: "image",
          src: "",
          placeholder: "💌",
          date: "Захидал",
          caption: "Бичсэн захидал бүрт хайр дүүрэн 💌",
        },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "📍",
          title: "Хаана уулзах вэ?",
          key: "place",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "✈️", name: "Нисэх буудал", desc: "Тосч авъя!", value: "Нисэх буудал" },
            { emoji: "🏠", name: "Чиний хотод", desc: "Очиж ирнэ", value: "Чиний хотод" },
            { emoji: "🌴", name: "Аялал", desc: "Шинэ газар", value: "Хамтдаа аялъя" },
            { emoji: "📱", name: "Онлайн", desc: "Видео дуудлага", value: "Онлайн date" },
            { emoji: "🏨", name: "Зочид буудал", desc: "Тусгай газар", value: "Зочид буудал" },
            { emoji: "☕", name: "Дуртай кафе", desc: "Бидний газар", value: "Дуртай кафе" },
          ],
        },
        {
          emoji: "💬",
          title: "Юу хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🎥", name: "Кино үзэх", value: "Хамтдаа кино үзнэ" },
            { emoji: "🍕", name: "Хоол хийх", value: "Хамтдаа хоол хийнэ" },
            { emoji: "📸", name: "Зураг авах", value: "Зураг авна" },
            { emoji: "🚶", name: "Алхах", value: "Хамтдаа алхана" },
            { emoji: "🛍️", name: "Shopping", value: "Shopping" },
            { emoji: "💃", name: "Бүжиглэх", value: "Бүжиглэнэ" },
          ],
        },
        {
          emoji: "⏰",
          title: "Хэдэн цагт?",
          key: "time",
          type: "time",
          multiSelect: false,
          options: [
            { label: "☀️ 14:00", value: "14:00" },
            { label: "🌅 17:00", value: "17:00" },
            { label: "🌙 19:00", value: "19:00" },
            { label: "✨ 20:00", value: "20:00" },
            { label: "🌃 21:00", value: "21:00" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🌅",
      title: "Баярлалаа 🎉",
      subtitle: "Бидний үүссэн хувь тавилангд талархаж байна. Ирээдүйд хамтдаа олон сайхан мөчийг бүтээх болно.\nЧинийгээ тэвэр дэрлэн тослох ирлийг\nидлэг идэхийг хүсье.\nХайртай шүү.",
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
      ],
      quotes: [
        "Хол байсан ч зүрх ойрхон 💕",
        "Нэг нарыг хардаг хоёр зүрх 🌅",
        "Зай хамаагүй, хайр хамгийн чухал ✈️💌",
        "Чамтай уулзах тэр мөчийг тоолж байна 🕐💕",
      ],
      footer: "Хайрын урилга © 2026",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🌅", "✈️", "💌", "💕", "🌍", "💖", "💗", "✨", "🛫", "💫"],
      heartRain: ["💌", "✈️", "🌅", "💕", "💖", "🌙", "🤍", "💜", "✨"],
      confettiColors: ["#ff6b6b", "#ee5a24", "#f9ca24", "#ff9ff3", "#ffcccc", "#fff3e0", "#fff", "#ffd1dc"],
      clickSparkles: ["✈️", "💌", "💕", "✨"],
      stickers: STICKERS_DISTANCE,
    },
  },

  // ─── Theme 2: Moonlight Distance ───
  {
    id: "ld-moonlight",
    category: "long-distance",
    customizer: null,
    card: {
      name: "Сарны гэрэл 🌙",
      desc: "Нэг сарыг хардаг хоёр зүрх",
      preview: "🌙💫",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
    },
    theme: {
      className: "theme-ld-moonlight",
      colors: {
        "--t-primary": "#667eea",
        "--t-secondary": "#764ba2",
        "--t-accent": "#a29bfe",
        "--t-accent2": "#dfe6e9",
        "--t-soft": "#b8c5f2",
        "--t-light": "#e8eaf6",
        "--t-bg": "#0a0a2e",
        "--t-bg2": "#12124a",
        "--t-glass": "rgba(102, 126, 234, 0.06)",
        "--t-glass-border": "rgba(102, 126, 234, 0.18)",
      },
    },
    welcome: {
      character: { ...WELCOME_MOON },
      title: "Гэгээн Валентины мэнд! 🌙",
      subtitle: "2.14 — Нэг сарны доор хоёулаа\nХол ч байсан зүрх нэг 💫",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Үргэлжлүүлэх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      envelope: { emoji: "💌", text: "Захиа ирлээ...", sparkleEmoji: "🌙" },
      title: "Сэтгэлийн үгс 🌙",
      content:
        "Шөнө болох бүрд сарыг харж чамайг санадаг. Чи бас тэр сарыг харж байгаа байх гэж бодоход зүрх минь дулаараадаг. Хол байсан ч бидний хайр ямар ч зайнаас хүчтэй. Энэ Valentine's Day чамд зориулсан хайрын захидал 🌙💕\n\nОдод бүр бидний хайрыг гэрчилж байна. Удахгүй уулзах тэр өдрийг хүлээж байна 💫✨",
      music: {
        url: "https://youtu.be/Ri3WsPDi4MY?si=izm75BPjlQSKNCBk",
        title: "🎵 Romantic Music",
        duration: 240,
      },
    },
    question: {
      character: { ...QUESTION_MOON },
      quizMode: true,
      quizQuestions: [
        {
          text: "Би чамайг өдөрт хэдэн удаа боддог вэ?",
          options: [
            { emoji: "1️⃣", name: "Нэг удаа", value: "Нэг удаа" },
            { emoji: "🔢", name: "10 удаа", value: "10 удаа" },
            { emoji: "💯", name: "100 удаа", value: "100 удаа" },
            { emoji: "♾️", name: "Тоолж баршгүй", value: "Тоолж баршгүй" },
          ],
          correctIndex: 0,
          correctText: "Зөв! Нэг ч удаа зогсдоггүй — чамайг ҮРГЭЛЖ боддог 💕",
        },
        {
          text: "Чиний юунд таалагддаг гэж бодож байна?",
          options: [
            { emoji: "😊", name: "Инээмсэглэл", value: "Инээмсэглэл" },
            { emoji: "💎", name: "Зан чанар", value: "Зан чанар" },
            { emoji: "👀", name: "Нүд", value: "Нүд" },
            { emoji: "💖", name: "Бүх зүйл", value: "Бүх зүйл" },
          ],
          correctIndex: 3,
          correctText: "Зөв! Би чиний бүх зүйлд хайртай 💖",
        },
        {
          text: "Би чамд хайртай болоод хэдэн жил болсон бэ?",
          options: [
            { emoji: "1️⃣", name: "1 жил", value: "1 жил" },
            { emoji: "2️⃣", name: "2 жил", value: "2 жил" },
            { emoji: "3️⃣", name: "3 жил", value: "3 жил" },
            { emoji: "♾️", name: "Мөнхөд", value: "Мөнхөд" },
          ],
          correctIndex: 1,
          correctText: "Зөв! 2 жилийн хайр, мөнхөд үргэлжлэх болно 💕",
        },
        {
          text: "Бид хоёрын хамгийн гоё дурсамж юу вэ?",
          multiSelect: true,
          allowOther: true,
          options: [
            { emoji: "✈️", name: "Анх уулзсан", value: "Анх уулзсан" },
            { emoji: "📱", name: "Шөнийн ярианууд", value: "Шөнийн ярианууд" },
            { emoji: "🎁", name: "Бэлэг өгсөн", value: "Бэлэг өгсөн" },
            { emoji: "🌅", name: "Хамтдаа аялсан", value: "Хамтдаа аялсан" },
            { emoji: "😂", name: "Хамт инээсэн", value: "Хамт инээсэн" },
          ],
        },
        {
          text: "Бид хоёрын хайр ямар юмтай адил вэ?",
          multiSelect: true,
          allowOther: true,
          options: [
            { emoji: "🌊", name: "Далай шиг гүн", value: "Далай шиг гүн" },
            { emoji: "⭐", name: "Од шиг гэрэлтэй", value: "Од шиг гэрэлтэй" },
            { emoji: "🔥", name: "Гал шиг халуун", value: "Гал шиг халуун" },
            { emoji: "🌸", name: "Цэцэг шиг гоё", value: "Цэцэг шиг гоё" },
            { emoji: "💎", name: "Алмаз шиг мөнхийн", value: "Алмаз шиг мөнхийн" },
          ],
        },
        {
          text: "Дараа уулзахдаа юу хийх вэ?",
          multiSelect: true,
          allowOther: true,
          options: [
            { emoji: "🤗", name: "Тэврэх", value: "Тэврэх" },
            { emoji: "😘", name: "Үнсэх", value: "Үнсэх" },
            { emoji: "🍽️", name: "Хамтдаа хоол идэх", value: "Хамтдаа хоол идэх" },
            { emoji: "🎬", name: "Кино үзэх", value: "Кино үзэх" },
            { emoji: "📸", name: "Зураг авах", value: "Зураг авах" },
          ],
        },
      ],
      text: "Би чиний юунд илүү дуртай вэ?",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerTitle: "Бидний дурсамжууд",
      continueButton: "Асуултууд 💕",
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "🌙",
          date: "Сарны гэрэл",
          caption: "Нэг сарыг хардаг бид хоёр 🌙",
        },
        {
          type: "image",
          src: "",
          placeholder: "💫",
          date: "Хамтын мөч",
          caption: "Хамтдаа байсан тэр шөнө ✨",
        },
        {
          type: "image",
          src: "",
          placeholder: "📱",
          date: "Видео дуудлага",
          caption: "Шөнийн дуудлага, чиний дуу хоолой 💜",
        },
        {
          type: "image",
          src: "",
          placeholder: "💌",
          date: "Хайрын захидал",
          caption: "Зүрхнээсээ бичсэн мессеж бүр 💌",
        },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "📍",
          title: "Хаана уулзах вэ?",
          key: "place",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "✈️", name: "Нисэх буудал", desc: "Тосч авъя!", value: "Нисэх буудал" },
            { emoji: "🏠", name: "Чиний хотод", desc: "Очиж ирнэ", value: "Чиний хотод" },
            { emoji: "🌴", name: "Аялал", desc: "Хамтдаа аялъя", value: "Хамтдаа аялъя" },
            { emoji: "📱", name: "Онлайн", desc: "Видео date", value: "Онлайн date" },
            { emoji: "🌃", name: "Шөнийн хот", desc: "Нэг хотод", value: "Шөнийн хот" },
            { emoji: "🏔️", name: "Байгаль", desc: "Тайван газар", value: "Байгаль" },
          ],
        },
        {
          emoji: "💬",
          title: "Юу хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🌙", name: "Од харах", value: "Хамтдаа од харна" },
            { emoji: "🎥", name: "Кино үзэх", value: "Кино үзнэ" },
            { emoji: "🍽️", name: "Хамтдаа хоол", value: "Хоол хийнэ" },
            { emoji: "📸", name: "Зураг авах", value: "Зураг авна" },
            { emoji: "🚶", name: "Алхах", value: "Алхана" },
            { emoji: "🕯️", name: "Лааны гэрэл", value: "Лааны гэрэлд" },
          ],
        },
        {
          emoji: "⏰",
          title: "Хэдэн цагт?",
          key: "time",
          type: "time",
          multiSelect: false,
          options: [
            { label: "🌅 18:00", value: "18:00" },
            { label: "🌙 20:00", value: "20:00" },
            { label: "✨ 21:00", value: "21:00" },
            { label: "🌃 22:00", value: "22:00" },
            { label: "🌌 23:00", value: "23:00" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🌙",
      title: "Баярлалаа 🎉",
      subtitle: "Бидний үүссэн хувь тавилангд талархаж байна. Ирээдүйд хамтдаа олон сайхан мөчийг бүтээх болно.\nЧинийгээ тэвэр дэрлэн тослох ирлийг\nидлэг идэхийг хүсье.\nХайртай шүү.",
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
      ],
      quotes: [
        "Нэг сарны доор хоёулаа, зүрх нэгдсэн хайр 🌙",
        "Тэнгэрт мянган од байвч чамаас өөр гэрэл байхгүй 💫",
        "Хол байсан ч зүрх үргэлж чам руу хандаж байна 💜",
        "Удахгүй уулзана, тэр мөч миний хамгийн аз жаргалтай мөч 🌙💕",
      ],
      footer: "Хайрын урилга © 2026",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🌙", "⭐", "💫", "✨", "💜", "💕", "🌟", "💖", "💗", "💞"],
      heartRain: ["🌙", "⭐", "💫", "✨", "💜", "💕", "🌟", "🤍", "💜"],
      confettiColors: ["#667eea", "#764ba2", "#a29bfe", "#dfe6e9", "#b8c5f2", "#e8eaf6", "#fff", "#c4b5fd"],
      clickSparkles: ["🌙", "💫", "✨", "⭐"],
      stickers: STICKERS_DISTANCE,
    },
  },

  // ─── Theme 3: Ocean Breeze ───
  {
    id: "ld-ocean",
    category: "long-distance",
    customizer: null,
    card: {
      name: "Далайн салхи 🌊",
      desc: "Далайн нөгөө талд байсан ч хайр нэг",
      preview: "🌊💙",
      tags: ["📸 Зургийн цомог", "🎉 Хөдөлгөөнт"],
    },
    theme: {
      className: "theme-ld-ocean",
      colors: {
        "--t-primary": "#0abde3",
        "--t-secondary": "#48dbfb",
        "--t-accent": "#00cec9",
        "--t-accent2": "#81ecec",
        "--t-soft": "#b2eaf5",
        "--t-light": "#dff9fb",
        "--t-bg": "#051a2e",
        "--t-bg2": "#0a2a45",
        "--t-glass": "rgba(10, 189, 227, 0.06)",
        "--t-glass-border": "rgba(10, 189, 227, 0.18)",
      },
    },
    welcome: {
      character: { ...WELCOME_PLANE },
      title: "Гэгээн Валентины мэнд! 🌊",
      subtitle: "2.14 — Далайн нөгөө талаас\nхайраа илэрхийлье 💙",
      timer: { ...DEFAULT_TIMER },
      buttonText: "Үргэлжлүүлэх 💌",
    },
    loveLetter: {
      enabled: true,
      ...DEFAULT_LOVE_LETTER_UI,
      envelope: { emoji: "💌", text: "Захиа ирлээ...", sparkleEmoji: "🌊" },
      title: "Сэтгэлийн үгс 🌊",
      content:
        "Далайн долгио чамайг санахад зүрхэнд минь ирдэг. Хол байсан ч усны урсгал шиг бидний хайр тасрахгүй. Чамтай хамт нэг далайн эрэг дээр зогсох тэр өдрийг хүлээн тэсэн ядаж байна. Энэ Valentine чамд зориулав 🌊💙\n\nДалайн салхи чиний сэтгэлийн дулааныг авчирдаг шиг санагддаг 💕✨",
      music: {
        url: "https://youtu.be/Ri3WsPDi4MY?si=izm75BPjlQSKNCBk",
        title: "🎵 Romantic Music",
        duration: 240,
      },
    },
    question: {
      character: { ...QUESTION_PLANE },
      quizMode: true,
      quizQuestions: [
        {
          text: "Би чамайг өдөрт хэдэн удаа боддог вэ?",
          options: [
            { emoji: "1️⃣", name: "Нэг удаа", value: "Нэг удаа" },
            { emoji: "🔢", name: "10 удаа", value: "10 удаа" },
            { emoji: "💯", name: "100 удаа", value: "100 удаа" },
            { emoji: "♾️", name: "Тоолж баршгүй", value: "Тоолж баршгүй" },
          ],
          correctIndex: 0,
          correctText: "Зөв! Нэг ч удаа зогсдоггүй — чамайг ҮРГЭЛЖ боддог 💕",
        },
        {
          text: "Чиний юунд таалагддаг гэж бодож байна?",
          options: [
            { emoji: "😊", name: "Инээмсэглэл", value: "Инээмсэглэл" },
            { emoji: "💎", name: "Зан чанар", value: "Зан чанар" },
            { emoji: "👀", name: "Нүд", value: "Нүд" },
            { emoji: "💖", name: "Бүх зүйл", value: "Бүх зүйл" },
          ],
          correctIndex: 3,
          correctText: "Зөв! Би чиний бүх зүйлд хайртай 💖",
        },
        {
          text: "Би чамд хайртай болоод хэдэн жил болсон бэ?",
          options: [
            { emoji: "1️⃣", name: "1 жил", value: "1 жил" },
            { emoji: "2️⃣", name: "2 жил", value: "2 жил" },
            { emoji: "3️⃣", name: "3 жил", value: "3 жил" },
            { emoji: "♾️", name: "Мөнхөд", value: "Мөнхөд" },
          ],
          correctIndex: 1,
          correctText: "Зөв! 2 жилийн хайр, мөнхөд үргэлжлэх болно 💕",
        },
        {
          text: "Бид хоёрын хамгийн гоё дурсамж юу вэ?",
          multiSelect: true,
          allowOther: true,
          options: [
            { emoji: "✈️", name: "Анх уулзсан", value: "Анх уулзсан" },
            { emoji: "📱", name: "Шөнийн ярианууд", value: "Шөнийн ярианууд" },
            { emoji: "🎁", name: "Бэлэг өгсөн", value: "Бэлэг өгсөн" },
            { emoji: "🌅", name: "Хамтдаа аялсан", value: "Хамтдаа аялсан" },
            { emoji: "😂", name: "Хамт инээсэн", value: "Хамт инээсэн" },
          ],
        },
        {
          text: "Бид хоёрын хайр ямар юмтай адил вэ?",
          multiSelect: true,
          allowOther: true,
          options: [
            { emoji: "🌊", name: "Далай шиг гүн", value: "Далай шиг гүн" },
            { emoji: "⭐", name: "Од шиг гэрэлтэй", value: "Од шиг гэрэлтэй" },
            { emoji: "🔥", name: "Гал шиг халуун", value: "Гал шиг халуун" },
            { emoji: "🌸", name: "Цэцэг шиг гоё", value: "Цэцэг шиг гоё" },
            { emoji: "💎", name: "Алмаз шиг мөнхийн", value: "Алмаз шиг мөнхийн" },
          ],
        },
        {
          text: "Дараа уулзахдаа юу хийх вэ?",
          multiSelect: true,
          allowOther: true,
          options: [
            { emoji: "🤗", name: "Тэврэх", value: "Тэврэх" },
            { emoji: "😘", name: "Үнсэх", value: "Үнсэх" },
            { emoji: "🍽️", name: "Хамтдаа хоол идэх", value: "Хамтдаа хоол идэх" },
            { emoji: "🎬", name: "Кино үзэх", value: "Кино үзэх" },
            { emoji: "📸", name: "Зураг авах", value: "Зураг авах" },
          ],
        },
      ],
      text: "Би чиний юунд илүү дуртай вэ?",
      yesButton: { ...DEFAULT_YES_BUTTON },
      noButton: { ...DEFAULT_NO_BUTTON },
    },
    memoryGallery: {
      ...DEFAULT_GALLERY_UI,
      headerTitle: "Бидний дурсамжууд",
      continueButton: "Асуултууд 💕",
      memories: [
        {
          type: "image",
          src: "",
          placeholder: "🌊",
          date: "Далайн эрэг",
          caption: "Хамтдаа далайн эргээр алхсан 🌊",
        },
        {
          type: "image",
          src: "",
          placeholder: "✈️",
          date: "Нислэг",
          caption: "Чам руу ниссэн тэр өдөр ✈️",
        },
        {
          type: "image",
          src: "",
          placeholder: "📱",
          date: "Цахим уулзалт",
          caption: "Дэлгэцний цаанаас ирдэг инээмсэглэл 💙",
        },
        {
          type: "image",
          src: "",
          placeholder: "🐚",
          date: "Далайн бэлэг",
          caption: "Далайн хясааг чамд зориулав 🐚",
        },
      ],
    },
    stepQuestions: {
      ...DEFAULT_STEP_UI,
      steps: [
        {
          emoji: "📍",
          title: "Хаана уулзах вэ?",
          key: "place",
          type: "grid",
          multiSelect: false,
          options: [
            { emoji: "🏖️", name: "Далайн эрэг", desc: "Далайд очъё!", value: "Далайн эрэг" },
            { emoji: "✈️", name: "Нисэх буудал", desc: "Тосч авъя!", value: "Нисэх буудал" },
            { emoji: "🌴", name: "Арал", desc: "Арал дээр", value: "Арал дээр" },
            { emoji: "📱", name: "Онлайн", desc: "Видео date", value: "Онлайн date" },
            { emoji: "🏠", name: "Чиний хотод", desc: "Очиж ирнэ", value: "Чиний хотод" },
            { emoji: "🛳️", name: "Усан онгоц", desc: "Далайн аялал", value: "Далайн аялал" },
          ],
        },
        {
          emoji: "💬",
          title: "Юу хийх вэ?",
          key: "activity",
          type: "grid",
          multiSelect: true,
          options: [
            { emoji: "🏊", name: "Усанд сэлэх", value: "Усанд сэлнэ" },
            { emoji: "🐚", name: "Хясаа түүх", value: "Хясаа түүнэ" },
            { emoji: "🌅", name: "Нар жаргалт", value: "Нар жаргалт харна" },
            { emoji: "📸", name: "Зураг авах", value: "Зураг авна" },
            { emoji: "🍽️", name: "Далайн хоол", value: "Далайн хоол иднэ" },
            { emoji: "🚶", name: "Эрэг алхах", value: "Эргээр алхана" },
          ],
        },
        {
          emoji: "⏰",
          title: "Хэдэн цагт?",
          key: "time",
          type: "time",
          multiSelect: false,
          options: [
            { label: "🌅 06:00", value: "06:00" },
            { label: "☀️ 10:00", value: "10:00" },
            { label: "🌊 14:00", value: "14:00" },
            { label: "🌅 17:00", value: "17:00" },
            { label: "🌙 20:00", value: "20:00" },
          ],
        },
      ],
    },
    finalSummary: {
      ...DEFAULT_FINAL_UI,
      headerEmoji: "🌊",
      title: "Баярлалаа 🎉",
      subtitle: "Бидний үүссэн хувь тавилангд талархаж байна. Ирээдүйд хамтдаа олон сайхан мөчийг бүтээх болно.\nЧинийгээ тэвэр дэрлэн тослох ирлийг\nидлэг идэхийг хүсье.\nХайртай шүү.",
      summaryFields: [
        { key: "place", emoji: "📍", label: "Уулзах газар" },
        { key: "activity", emoji: "🎯", label: "Хийх зүйл" },
        { key: "time", emoji: "⏰", label: "Цаг" },
      ],
      quotes: [
        "Далайн нөгөө талд байсан ч зүрх нэг цохилдог 🌊",
        "Усны урсгал шиг бидний хайр тасрахгүй 💙",
        "Далайн долгио чиний хайрыг авчирдаг 🌊💕",
        "Нэг далайн доор нэг зүрхтэйгээр 💙✨",
      ],
      footer: "Хайрын урилга © 2026",
    },
    effects: {
      ...DEFAULT_EFFECTS,
      floatingHearts: ["🌊", "🐚", "💙", "✨", "🦋", "💕", "🌅", "💖", "💗", "💞"],
      heartRain: ["🌊", "💙", "🐚", "✨", "💕", "🌅", "🤍", "💜", "💫"],
      confettiColors: ["#0abde3", "#48dbfb", "#00cec9", "#81ecec", "#b2eaf5", "#dff9fb", "#fff", "#76d7ea"],
      clickSparkles: ["🌊", "🐚", "💙", "✨"],
      stickers: STICKERS_DISTANCE,
    },
  },
];

export const CATEGORIES_CONFIG = {
  crush: CRUSH_TEMPLATES,
  "new-couple": NEW_COUPLE_TEMPLATES,
  "long-term": LONG_TERM_TEMPLATES,
  y2k: Y2K_TEMPLATES,
  "long-distance": LONG_DISTANCE_TEMPLATES,
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
