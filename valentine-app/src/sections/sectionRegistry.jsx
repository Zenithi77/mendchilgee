// ═══════════════════════════════════════════════════════════════
// Section Registry
// ═══════════════════════════════════════════════════════════════
//
// Maps each section type to its renderer component and metadata.
// Used by GiftRenderer to resolve which component to render.
// Also useful for the future Builder UI (icons, labels).
// ═══════════════════════════════════════════════════════════════

import Welcome2 from "../components/Welcome2";
import LoveLetter from "../components/LoveLetter";
import MovieSelection from "../components/MovieSelection";
import MemoryGallery2 from "../components/MemoryGallery2";
import MemoryVideo from "../components/MemoryVideo";
import SpecialQuestions from "../components/SpecialQuestions";
import { SECTION_TYPES } from "../models/gift";
import {
  MdCelebration,
  MdMail,
  MdPhotoCamera,
  MdAutoAwesome,
  MdLightbulb,
  MdMovie,
  MdVideocam,
} from "react-icons/md";

export const SECTION_REGISTRY = {
  [SECTION_TYPES.WELCOME]: {
    component: Welcome2,
    label: "Welcome",
    labelMn: "Нүүр хэсэг",
    descMn: "Хайрын түүхээ хамгийн сайхнаар эхлүүлээрэй",
    icon: <MdCelebration />,
    iconBg: "#fce7f3",
    iconColor: "#ec4899",
  },
  [SECTION_TYPES.LOVE_LETTER]: {
    component: LoveLetter,
    label: "Love Letter",
    labelMn: "Захидал хэсэг",
    descMn: "Зүрхний үгээ цаасан дээр биш энд үлдээгээрэй",
    icon: <MdMail />,
    iconBg: "#fefce8",
    iconColor: "#eab308",
  },
  [SECTION_TYPES.MOVIE_SELECTION]: {
    component: MovieSelection,
    label: "Movie Selection",
    labelMn: "Кино сонголт",
    descMn: "Киноны постеруудаас сонгоод ticketing нээгээрэй",
    icon: <MdMovie />,
    iconBg: "#e0f2fe",
    iconColor: "#0284c7",
  },
  [SECTION_TYPES.MEMORY_GALLERY]: {
    component: MemoryGallery2,
    label: "Memory Gallery",
    labelMn: "Зургийн цомог",
    descMn: "Дурсамж дүүрэн зургуудаа гулсдаг хэлбэрээр үзүүлээрэй",
    icon: <MdPhotoCamera />,
    iconBg: "#fff7ed",
    iconColor: "#f97316",
  },
  [SECTION_TYPES.MEMORY_VIDEO]: {
    component: MemoryVideo,
    label: "Video",
    labelMn: "Видео хэсэг",
    descMn: "Өөрийн бичлэгүүдээ оруулаад үзүүлээрэй",
    icon: <MdVideocam />,
    iconBg: "#fef3c7",
    iconColor: "#d97706",
  },
  [SECTION_TYPES.SPECIAL_QUESTIONS]: {
    component: SpecialQuestions,
    label: "Special Questions",
    labelMn: "Тусгай асуулт",
    descMn: "4 тусгай quiz асуулт — нууц хайрцагтай",
    icon: <MdLightbulb />,
    iconBg: "#fdf2f8",
    iconColor: "#db2777",
  },
};

/**
 * Get list of available section types for the builder UI.
 */
export function getAvailableSectionTypes() {
  return Object.entries(SECTION_REGISTRY).map(([type, meta]) => ({
    type,
    label: meta.label,
    labelMn: meta.labelMn,
    descMn: meta.descMn,
    icon: meta.icon,
    iconBg: meta.iconBg,
    iconColor: meta.iconColor,
  }));
}
