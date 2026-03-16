// ═══════════════════════════════════════════════════════════════
// Pricing Configuration — Simple pay-per-gift
// ═══════════════════════════════════════════════════════════════
//
// Base price: ₮5,000 (includes 15 seconds of video)
// Every image: ₮500 each
// Video over 15 seconds: ₮500 per 10 seconds
// Max video duration: 60 seconds (1 minute)
// ═══════════════════════════════════════════════════════════════

/** Base price for every gift */
export const BASE_PRICE = 5000;

/** Number of images included in the base price (0 = every image costs extra) */
export const INCLUDED_IMAGES = 0;

/** Price per image */
export const EXTRA_IMAGE_PRICE = 500;

/** Video seconds included in the base price */
export const INCLUDED_VIDEO_SECONDS = 15;

/** Price per 10-second video chunk (above included seconds) */
export const EXTRA_VIDEO_PRICE = 500;

/** Seconds per video pricing chunk */
export const VIDEO_CHUNK_SECONDS = 10;

/** Absolute maximum video duration in seconds (1 minute) */
export const MAX_VIDEO_SECONDS = 60;

/**
 * Count images, videos, and total video seconds from a gift's sections.
 */
export function countGiftMedia(gift) {
  let imageCount = 0;
  let videoCount = 0;
  let totalVideoSeconds = 0;

  for (const section of gift?.sections || []) {
    if (section.type === "memoryGallery") {
      imageCount += (section.data?.memories || []).filter((m) => m.src).length;
    }
    if (section.type === "memoryVideo") {
      const vids = (section.data?.videos || []).filter((v) => v.src);
      videoCount += vids.length;
      totalVideoSeconds += vids.reduce((sum, v) => sum + (v.duration || 0), 0);
    }
  }

  return { imageCount, videoCount, totalVideoSeconds };
}

/**
 * Calculate the total price for a gift based on its content.
 * @param {number} imageCount — total uploaded images
 * @param {number} totalVideoSeconds — total video duration in seconds
 * @returns {{ base, imageCount, imgCost, includedVideoSeconds, extraVideoSeconds, videoChunks, vidCost, totalVideoSeconds, total }}
 */
export function calcGiftPrice(imageCount, totalVideoSeconds = 0) {
  const imgCost = imageCount * EXTRA_IMAGE_PRICE;

  // First INCLUDED_VIDEO_SECONDS are free, then charge per VIDEO_CHUNK_SECONDS
  const extraVideoSeconds = Math.max(0, totalVideoSeconds - INCLUDED_VIDEO_SECONDS);
  const videoChunks = extraVideoSeconds > 0 ? Math.ceil(extraVideoSeconds / VIDEO_CHUNK_SECONDS) : 0;
  const vidCost = videoChunks * EXTRA_VIDEO_PRICE;

  return {
    base: BASE_PRICE,
    imageCount,
    imgCost,
    includedVideoSeconds: INCLUDED_VIDEO_SECONDS,
    extraVideoSeconds,
    videoChunks,
    totalVideoSeconds,
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
