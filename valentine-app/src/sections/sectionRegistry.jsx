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
import FunQuestions from "../components/FunQuestions";
import SpecialQuestions from "../components/SpecialQuestions";
import SimpleQuestions from "../components/SimpleQuestions";
import FinalSummary2 from "../components/FinalSummary2";
import Question2 from "../components/Question2";
import StepQuestions2 from "../components/StepQuestions2";
import { SECTION_TYPES } from "../models/gift";
import {
  MdCelebration,
  MdMail,
  MdPhotoCamera,
  MdAutoAwesome,
  MdLightbulb,
  MdMovie,
  MdVideocam,
  MdQuestionAnswer,
  MdChat,
} from "react-icons/md";

export const SECTION_REGISTRY = {
  [SECTION_TYPES.WELCOME]: {
    component: Welcome2,
    label: "Welcome",
    labelMn: "Нүүр хэсэг",
    descMn: "Мэндчилгээгээ сайхан нүүрээр эхлүүлээрэй",
    icon: <MdCelebration />,
    iconBg: "#fce7f3",
    iconColor: "#ec4899",
  },
  [SECTION_TYPES.LOVE_LETTER]: {
    component: LoveLetter,
    label: "Love Letter",
    labelMn: "Захидал хэсэг",
    descMn: "Мэдэгдэхүүн болон захидлаа сайхнаар бичээрэй",
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
    hidden: true,
  },
  [SECTION_TYPES.MEMORY_GALLERY]: {
    component: MemoryGallery2,
    label: "Memory Gallery",
    labelMn: "Зургийн цомог",
    descMn: "Зургуудаа гулсдаг хэлбэрээр сайхан харуулаарай",
    icon: <MdPhotoCamera />,
    iconBg: "#fff7ed",
    iconColor: "#f97316",
  },
  [SECTION_TYPES.MEMORY_VIDEO]: {
    component: MemoryVideo,
    label: "Video",
    labelMn: "Видео хэсэг",
    descMn: "Бичлэгүүдээ оруулаад үзүүлээрэй",
    icon: <MdVideocam />,
    iconBg: "#fef3c7",
    iconColor: "#d97706",
  },
  [SECTION_TYPES.FUN_QUESTIONS]: {
    component: FunQuestions,
    label: "Fun Questions",
    labelMn: "Хөгжилтэй асуулт",
    descMn: "Хайртай хүндээ зориулсан хөгжилтэй асуултууд",
    icon: <MdQuestionAnswer />,
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
    hidden: true,
  },
  [SECTION_TYPES.SPECIAL_QUESTIONS]: {
    component: SpecialQuestions,
    label: "Special Questions",
    labelMn: "Тусгай асуулт",
    descMn: "4 тусгай quiz асуулт — нууц хайрцагтай",
    icon: <MdLightbulb />,
    iconBg: "#fdf2f8",
    iconColor: "#db2777",
    hidden: true,
  },
  [SECTION_TYPES.SIMPLE_QUESTIONS]: {
    component: SimpleQuestions,
    label: "Simple Questions",
    labelMn: "Асуулт",
    descMn: "Асуултуудаа оруулаад хариултыг нь аваарай",
    icon: <MdChat />,
    iconBg: "#fff0f3",
    iconColor: "#e60023",
  },
  [SECTION_TYPES.STEP_QUESTIONS]: {
    component: StepQuestions2,
    label: "Step Questions",
    labelMn: "Алхамт асуулт",
    descMn: "Сонголттой асуултууд",
    icon: <MdQuestionAnswer />,
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
    hidden: true,
  },
  [SECTION_TYPES.QUESTION]: {
    component: Question2,
    label: "Question",
    labelMn: "Асуулт",
    descMn: "Тийм/Үгүй асуулт",
    icon: <MdAutoAwesome />,
    iconBg: "#fdf2f8",
    iconColor: "#db2777",
    hidden: true,
  },
  [SECTION_TYPES.FINAL_SUMMARY]: {
    component: FinalSummary2,
    label: "Final Summary",
    labelMn: "Дүгнэлт",
    descMn: "Мэндчилгээний нэгтгэл",
    icon: <MdCelebration />,
    iconBg: "#fce7f3",
    iconColor: "#ec4899",
    hidden: true,
  },
};

/**
 * Get list of available section types for the builder UI.
 */
export function getAvailableSectionTypes() {
  return Object.entries(SECTION_REGISTRY)
    .filter(([, meta]) => !meta.hidden)
    .map(([type, meta]) => ({
      type,
      label: meta.label,
      labelMn: meta.labelMn,
      descMn: meta.descMn,
      icon: meta.icon,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
    }));
}
