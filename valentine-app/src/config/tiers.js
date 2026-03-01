// ═══════════════════════════════════════════════════════════════
// Tier Definitions — SINGLE SOURCE OF TRUTH
// ═══════════════════════════════════════════════════════════════
//
// All tier logic across the app MUST reference these constants.
// Do NOT duplicate tier definitions elsewhere.
// ═══════════════════════════════════════════════════════════════

export const TIERS = {
  FREE: "free",
  STANDARD: "standard",
  PREMIUM: "premium",
};

/** Ordered list for comparison: higher index = higher tier */
export const TIER_ORDER = [TIERS.FREE, TIERS.STANDARD, TIERS.PREMIUM];

/**
 * Compare two tiers. Returns:
 *  -1 if a < b
 *   0 if a === b
 *   1 if a > b
 */
export function compareTiers(a, b) {
  const ai = TIER_ORDER.indexOf(a || TIERS.FREE);
  const bi = TIER_ORDER.indexOf(b || TIERS.FREE);
  if (ai < bi) return -1;
  if (ai > bi) return 1;
  return 0;
}

/** Is tierA >= tierB? */
export function tierSatisfies(has, needs) {
  return compareTiers(has, needs) >= 0;
}

/** Expiration durations in days per tier */
export const TIER_DURATION_DAYS = {
  [TIERS.FREE]: 7,
  [TIERS.STANDARD]: 14,
  [TIERS.PREMIUM]: 30,
};

/** Display metadata per tier */
export const TIER_META = {
  [TIERS.FREE]: {
    label: "Free",
    labelMn: "Үнэгүй",
    badge: "●",
    color: "#22c55e",
    bgColor: "#ecfdf5",
  },
  [TIERS.STANDARD]: {
    label: "Standard",
    labelMn: "Стандарт",
    badge: "●",
    color: "#3b82f6",
    bgColor: "#eff6ff",
  },
  [TIERS.PREMIUM]: {
    label: "Premium",
    labelMn: "Премиум",
    badge: "●",
    color: "#a855f7",
    bgColor: "#faf5ff",
  },
};

/** Display price for UI only — backend calculates real price */
export const TIER_DISPLAY_PRICE = {
  [TIERS.STANDARD]: "₮6,000",
  [TIERS.PREMIUM]: "₮9,000",
};
