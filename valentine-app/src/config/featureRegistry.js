// ═══════════════════════════════════════════════════════════════
// Feature Registry — Tier-aware feature/section registry
// ═══════════════════════════════════════════════════════════════
//
// Central mapping of features → required tier + limits.
// Used by: Builder, AddSectionModal, tier calculation,
//          watermark logic, expiration logic.
//
// DO NOT duplicate tier logic outside this file.
// ═══════════════════════════════════════════════════════════════

import { TIERS } from "./tiers";
import { SECTION_TYPES } from "../models/gift";

/**
 * FEATURE_REGISTRY
 *
 * Each key matches a SECTION_TYPE.
 * `requiredTier` — minimum tier to publish without watermark.
 * `limits`       — per-tier limits (images, video duration, etc.)
 * `editable`     — whether content is editable at each tier.
 */
export const FEATURE_REGISTRY = {
  [SECTION_TYPES.WELCOME]: {
    label: "Welcome",
    labelMn: "Нүүр хэсэг",
    requiredTier: TIERS.FREE,
    editable: {
      [TIERS.FREE]: false, // Cannot edit content on Free
      [TIERS.STANDARD]: true,
      [TIERS.PREMIUM]: true,
    },
    icon: "🎉",
  },

  [SECTION_TYPES.LOVE_LETTER]: {
    label: "Love Letter",
    labelMn: "Захидал хэсэг",
    requiredTier: TIERS.STANDARD,
    editable: {
      [TIERS.FREE]: false,
      [TIERS.STANDARD]: true,
      [TIERS.PREMIUM]: true,
    },
    icon: "💌",
  },

  [SECTION_TYPES.MOVIE_SELECTION]: {
    label: "Movie Selection",
    labelMn: "Кино сонголт",
    requiredTier: TIERS.STANDARD,
    editable: {
      [TIERS.FREE]: false,
      [TIERS.STANDARD]: true,
      [TIERS.PREMIUM]: true,
    },
    icon: "🎬",
  },

  [SECTION_TYPES.MEMORY_GALLERY]: {
    label: "Memory Gallery",
    labelMn: "Зургийн цомог",
    requiredTier: TIERS.STANDARD,
    limits: {
      [TIERS.FREE]: { maxImages: 0 },
      [TIERS.STANDARD]: { maxImages: 6 },
      [TIERS.PREMIUM]: { maxImages: 10 },
    },
    editable: {
      [TIERS.FREE]: false,
      [TIERS.STANDARD]: true,
      [TIERS.PREMIUM]: true,
    },
    icon: "📸",
  },

  [SECTION_TYPES.MEMORY_VIDEO]: {
    label: "Video",
    labelMn: "Видео хэсэг",
    requiredTier: TIERS.PREMIUM,
    limits: {
      [TIERS.FREE]: { maxDurationMinutes: 0 },
      [TIERS.STANDARD]: { maxDurationMinutes: 2 },
      [TIERS.PREMIUM]: { maxDurationMinutes: 5 },
    },
    editable: {
      [TIERS.FREE]: false,
      [TIERS.STANDARD]: true,
      [TIERS.PREMIUM]: true,
    },
    icon: "🎬",
  },

  [SECTION_TYPES.FUN_QUESTIONS]: {
    label: "Fun Questions",
    labelMn: "Хөгжилтэй асуулт",
    requiredTier: TIERS.FREE,
    editable: {
      [TIERS.FREE]: true,
      [TIERS.STANDARD]: true,
      [TIERS.PREMIUM]: true,
    },
    icon: "💬",
  },

  [SECTION_TYPES.FINAL_SUMMARY]: {
    label: "Final Summary",
    labelMn: "Хураангуй хэсэг",
    requiredTier: TIERS.FREE,
    editable: {
      [TIERS.FREE]: false, // Cannot change theme or styling
      [TIERS.STANDARD]: true,
      [TIERS.PREMIUM]: true,
    },
    icon: "🎊",
  },
  [SECTION_TYPES.SIMPLE_QUESTIONS]: {
    label: "Simple Questions",
    labelMn: "Асуулт",
    requiredTier: TIERS.FREE,
    editable: {
      [TIERS.FREE]: true,
      [TIERS.STANDARD]: true,
      [TIERS.PREMIUM]: true,
    },
    icon: "💬",
  },};

// ── Premium-only future features (reserved keys) ──
export const RESERVED_FEATURES = {
  customSlug: {
    label: "Custom URL Slug",
    labelMn: "Захиалгат холбоос",
    requiredTier: TIERS.PREMIUM,
    icon: "🔗",
    reserved: true,
  },
  aiLetterAssist: {
    label: "AI Letter Assist",
    labelMn: "AI захидал туслагч",
    requiredTier: TIERS.PREMIUM,
    icon: "🤖",
    reserved: true,
  },
};

// ── Feature for theme/style editing ──
export const STYLE_FEATURE = {
  themeSwitch: {
    label: "Theme / Styling",
    labelMn: "Загвар / Стиль",
    requiredTier: TIERS.STANDARD,
    icon: "🎨",
  },
};

/**
 * Get feature info for a section type.
 */
export function getFeatureForSection(sectionType) {
  return FEATURE_REGISTRY[sectionType] || null;
}

/**
 * Get the required tier for a specific section type.
 */
export function getSectionRequiredTier(sectionType) {
  const feature = FEATURE_REGISTRY[sectionType];
  return feature ? feature.requiredTier : TIERS.FREE;
}

/**
 * Get limits for a section at a given tier.
 */
export function getSectionLimits(sectionType, tier) {
  const feature = FEATURE_REGISTRY[sectionType];
  if (!feature?.limits) return null;
  return feature.limits[tier] || feature.limits[TIERS.FREE] || null;
}

/**
 * Check if a section is editable at a given tier.
 */
export function isSectionEditable(sectionType, tier) {
  const feature = FEATURE_REGISTRY[sectionType];
  if (!feature?.editable) return true;
  return feature.editable[tier] ?? false;
}
