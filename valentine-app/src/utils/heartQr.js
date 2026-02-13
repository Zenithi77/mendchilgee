// ═══════════════════════════════════════════════════════════════
// Heart-shaped QR Code Generator
// ═══════════════════════════════════════════════════════════════
//
// Generates a QR code masked into a heart shape with a small ❤️
// in the center. Returns a data-URL (PNG).
// ═══════════════════════════════════════════════════════════════

import QRCode from "qrcode";

/**
 * Check whether (x, y) falls inside a heart curve.
 * The heart is centered at (cx, cy) with half-size `r`.
 */
function isInsideHeart(x, y, cx, cy, r) {
  // Normalize to [-1, 1] with y-axis flipped
  const nx = (x - cx) / r;
  const ny = -(y - cy) / r;
  // Implicit heart equation: (x²+y²-1)³ - x²y³ ≤ 0
  const a = nx * nx + ny * ny - 1;
  return a * a * a - nx * nx * ny * ny * ny <= 0;
}

/**
 * Generate a heart-shaped QR code as a data-URL.
 *
 * @param {string} text - Data to encode
 * @param {object} opts
 * @param {number} opts.size  - Canvas size in px (default 512)
 * @param {string} opts.color - QR module color (default "#e60023")
 * @returns {Promise<string>} PNG data-URL
 */
export async function generateHeartQR(text, { size = 512, color = "#e60023" } = {}) {
  // 1. Generate raw QR matrix via qrcode lib
  const segments = [{ data: text, mode: "byte" }];
  const code = QRCode.create(segments, { errorCorrectionLevel: "H" });
  const modules = code.modules;
  const moduleCount = modules.size; // number of modules per side

  // 2. Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Transparent background
  ctx.clearRect(0, 0, size, size);

  // 3. Map modules onto the heart
  const cx = size / 2;
  const cy = size / 2 + size * 0.04; // slight downward offset
  const heartRadius = size * 0.46;

  // Calculate module pixel size so modules fill the heart area
  const moduleSize = (heartRadius * 2 * 0.82) / moduleCount;
  const gridOriginX = cx - (moduleCount * moduleSize) / 2;
  const gridOriginY = cy - (moduleCount * moduleSize) / 2 - size * 0.02;

  // Draw heart-shaped QR modules
  ctx.fillStyle = color;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const px = gridOriginX + col * moduleSize + moduleSize / 2;
      const py = gridOriginY + row * moduleSize + moduleSize / 2;
      if (!isInsideHeart(px, py, cx, cy, heartRadius)) continue;

      if (modules.get(row, col)) {
        // Dark module — draw filled rounded rect
        const x = gridOriginX + col * moduleSize;
        const y = gridOriginY + row * moduleSize;
        const r = moduleSize * 0.15;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + moduleSize - r, y);
        ctx.quadraticCurveTo(x + moduleSize, y, x + moduleSize, y + r);
        ctx.lineTo(x + moduleSize, y + moduleSize - r);
        ctx.quadraticCurveTo(x + moduleSize, y + moduleSize, x + moduleSize - r, y + moduleSize);
        ctx.lineTo(x + r, y + moduleSize);
        ctx.quadraticCurveTo(x, y + moduleSize, x, y + moduleSize - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.fill();
      }
    }
  }

  // 4. Draw center heart emoji
  const heartSize = size * 0.08;
  ctx.font = `${heartSize}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // White circle behind
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx, cy, heartSize * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText("❤️", cx, cy);

  return canvas.toDataURL("image/png");
}
