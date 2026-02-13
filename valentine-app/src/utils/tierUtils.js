// ═══════════════════════════════════════════════════════════════
// Tier Utilities — Pure functions for tier calculation & checks
// ═══════════════════════════════════════════════════════════════
//
// These functions are deterministic, side-effect free, and must
// be used everywhere tier logic is needed.
// ═══════════════════════════════════════════════════════════════

import {
  TIERS,
  compareTiers,
  tierSatisfies,
  TIER_DURATION_DAYS,
} from "../config/tiers";
import {
  FEATURE_REGISTRY,
  getSectionRequiredTier,
  getSectionLimits,
} from "../config/featureRegistry";

/**
 * getRequiredTier — determine the minimum tier required for a gift
 * based on which sections/features it uses.
 *
 * @param {Array} sections — gift.sections array
 * @returns {"free" | "standard" | "premium"}
 *
 * Rules:
 *  - Free-only features → "free"
 *  - Any Standard feature present → "standard"
 *  - Any Premium feature present → "premium"
 */
export function getRequiredTier(sections) {
  if (!sections || sections.length === 0) return TIERS.FREE;

  let highest = TIERS.FREE;

  for (const section of sections) {
    const needed = getSectionRequiredTier(section.type);
    if (compareTiers(needed, highest) > 0) {
      highest = needed;
    }

    // Check data-driven limits (e.g. image count in memory gallery)
    if (section.type === "memoryGallery" && section.data?.memories) {
      const imageCount = section.data.memories.length;
      const standardLimits = getSectionLimits(section.type, TIERS.STANDARD);
      if (standardLimits?.maxImages && imageCount > standardLimits.maxImages) {
        if (compareTiers(TIERS.PREMIUM, highest) > 0) {
          highest = TIERS.PREMIUM;
        }
      }
    }

    // Early exit if already at max tier
    if (highest === TIERS.PREMIUM) break;
  }

  return highest;
}

/**
 * Check whether a gift needs a watermark.
 *
 * Show watermark when:
 *  - requiredTier > paidTier
 *  - OR paymentExpired === true
 *
 * Do NOT show watermark when:
 *  - paidTier >= requiredTier AND currentTime < expiresAt
 */
export function shouldShowWatermark(gift) {
  if (!gift) return false;

  const requiredTier = getRequiredTier(gift.sections);
  const paidTier = gift.paidTier || TIERS.FREE;
  const paymentExpired = gift.paymentExpired === true;

  // If expired, always show watermark
  if (paymentExpired) return true;

  // If required tier is free, no watermark needed
  if (requiredTier === TIERS.FREE) return false;

  // If paid tier satisfies required tier, check expiration
  if (tierSatisfies(paidTier, requiredTier)) {
    // Check if still within active period
    if (gift.expiresAt) {
      const expiresAt = gift.expiresAt?.toDate
        ? gift.expiresAt.toDate()
        : new Date(gift.expiresAt);
      return Date.now() >= expiresAt.getTime();
    }
    // Has paid tier but no expiry set — no watermark
    return false;
  }

  // paidTier < requiredTier → show watermark
  return true;
}

/**
 * Check if a gift's payment has expired.
 */
export function isPaymentExpired(gift) {
  if (!gift) return false;
  if (gift.paymentExpired === true) return true;

  const paidTier = gift.paidTier || TIERS.FREE;
  if (paidTier === TIERS.FREE) return false;

  if (gift.expiresAt) {
    const expiresAt = gift.expiresAt?.toDate
      ? gift.expiresAt.toDate()
      : new Date(gift.expiresAt);
    return Date.now() >= expiresAt.getTime();
  }

  return false;
}

/**
 * Check whether the user needs to upgrade/pay.
 * Returns true if requiredTier > paidTier OR payment expired.
 */
export function needsUpgrade(gift) {
  if (!gift) return false;

  const requiredTier = getRequiredTier(gift.sections);
  const paidTier = gift.paidTier || TIERS.FREE;

  if (requiredTier === TIERS.FREE) return false;
  if (gift.paymentExpired === true) return true;

  return !tierSatisfies(paidTier, requiredTier);
}

/**
 * Get the list of features causing a tier upgrade.
 * Returns array of { sectionType, labelMn, requiredTier, tierMeta }
 */
export function getUpgradeReasons(sections) {
  if (!sections) return [];

  const reasons = [];

  for (const section of sections) {
    const feature = FEATURE_REGISTRY[section.type];
    if (feature && feature.requiredTier !== TIERS.FREE) {
      reasons.push({
        sectionType: section.type,
        label: feature.label,
        labelMn: feature.labelMn,
        requiredTier: feature.requiredTier,
        icon: feature.icon,
      });
    }
  }

  return reasons;
}

/**
 * Calculate expiration date from activation time and tier.
 */
export function calculateExpiresAt(activatedAt, tier) {
  const date =
    activatedAt instanceof Date ? activatedAt : new Date(activatedAt);
  const days = TIER_DURATION_DAYS[tier] || TIER_DURATION_DAYS[TIERS.FREE];
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Get remaining days until expiration.
 * Returns 0 if expired.
 */
export function getRemainingDays(expiresAt) {
  if (!expiresAt) return 0;
  const exp = expiresAt?.toDate ? expiresAt.toDate() : new Date(expiresAt);
  const diff = exp.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}
