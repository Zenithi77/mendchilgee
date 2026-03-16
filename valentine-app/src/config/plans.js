// ═══════════════════════════════════════════════════════════════
// Pricing Configuration — Simple pay-per-gift
// ═══════════════════════════════════════════════════════════════
//
// Base price: ₮5,000  (includes 4 images)
// Extra images beyond 4: ₮500 each
// Extra video clips: ₮500 each
// Max video duration: 60 seconds (1 minute)
// ═══════════════════════════════════════════════════════════════

/** Base price for every gift */
export const BASE_PRICE = 5000;

/** Number of images included in the base price */
export const INCLUDED_IMAGES = 4;

/** Price per extra image beyond the included amount */
export const EXTRA_IMAGE_PRICE = 500;

/** Price per video clip */
export const EXTRA_VIDEO_PRICE = 500;

/** Absolute maximum video duration in seconds (1 minute) */
export const MAX_VIDEO_SECONDS = 60;

/**
 * Count images and videos from a gift's sections.
 */
export function countGiftMedia(gift) {
  let imageCount = 0;
  let videoCount = 0;

  for (const section of gift?.sections || []) {
    if (section.type === "memoryGallery") {
      imageCount += (section.data?.memories || []).filter((m) => m.src).length;
    }
    if (section.type === "memoryVideo") {
      videoCount += (section.data?.videos || []).filter((v) => v.src).length;
    }
  }

  return { imageCount, videoCount };
}

/**
 * Calculate the total price for a gift based on its content.
 * @param {number} imageCount — total uploaded images
 * @param {number} videoCount — total uploaded video clips
 * @returns {{ base, includedImages, extraImages, imgCost, videoCount, vidCost, total }}
 */
export function calcGiftPrice(imageCount, videoCount) {
  const extraImages = Math.max(0, imageCount - INCLUDED_IMAGES);
  const imgCost = extraImages * EXTRA_IMAGE_PRICE;
  const vidCost = videoCount * EXTRA_VIDEO_PRICE;

  return {
    base: BASE_PRICE,
    includedImages: INCLUDED_IMAGES,
    extraImages,
    imgCost,
    videoCount,
    vidCost,
    total: BASE_PRICE + imgCost + vidCost,
  };
}

/**
 * Format seconds to "X мин Y сек" display.
 */
export function formatSeconds(seconds) {
  if (seconds <= 0) return "0 сек";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${m} мин ${s} сек`;
  if (m > 0) return `${m} мин`;
  return `${s} сек`;
}
