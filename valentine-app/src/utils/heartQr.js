// ═══════════════════════════════════════════════════════════════
// QR Code Generator with Heart Center
// ═══════════════════════════════════════════════════════════════
//
// Generates a regular QR code in red with a small ❤️ in the
// center. Returns a data-URL (PNG).
// ═══════════════════════════════════════════════════════════════

import QRCode from "qrcode";

/**
 * Generate a QR code with a heart emoji in the center as a data-URL.
 *
 * @param {string} text - Data to encode
 * @param {object} opts
 * @param {number} opts.size  - Canvas size in px (default 512)
 * @param {string} opts.color - QR module color (default "#e60023")
 * @returns {Promise<string>} PNG data-URL
 */
export async function generateHeartQR(
  text,
  { size = 512, color = "#e60023" } = {},
) {
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

  // 3. Draw full QR code
  const padding = size * 0.05;
  const moduleSize = (size - padding * 2) / moduleCount;
  const gridOriginX = padding;
  const gridOriginY = padding;

  ctx.fillStyle = color;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules.get(row, col)) {
        const x = gridOriginX + col * moduleSize;
        const y = gridOriginY + row * moduleSize;
        const r = moduleSize * 0.15;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + moduleSize - r, y);
        ctx.quadraticCurveTo(x + moduleSize, y, x + moduleSize, y + r);
        ctx.lineTo(x + moduleSize, y + moduleSize - r);
        ctx.quadraticCurveTo(
          x + moduleSize,
          y + moduleSize,
          x + moduleSize - r,
          y + moduleSize,
        );
        ctx.lineTo(x + r, y + moduleSize);
        ctx.quadraticCurveTo(x, y + moduleSize, x, y + moduleSize - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.fill();
      }
    }
  }

  // 4. Draw center heart emoji
  const cx = size / 2;
  const cy = size / 2;
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
