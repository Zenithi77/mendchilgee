// ═══════════════════════════════════════════════════════════════
// QR Code Generator with Shape Frames
// ═══════════════════════════════════════════════════════════════
//
// Shapes: "square" (default), "heart", "star", "flower"
// Each shape draws a decorative coloured frame around the QR.
// The QR itself stays fully square & scannable inside.
// ═══════════════════════════════════════════════════════════════

import QRCode from "qrcode";

// ── shape path helpers ──────────────────────────────────────

function heartPath(ctx, cx, cy, s) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.35);
  ctx.bezierCurveTo(cx, cy - s * 0.7, cx - s * 0.65, cy - s * 0.9, cx - s * 0.95, cy - s * 0.5);
  ctx.bezierCurveTo(cx - s * 1.15, cy - s * 0.15, cx - s * 0.7, cy + s * 0.3, cx, cy + s * 0.85);
  ctx.bezierCurveTo(cx + s * 0.7, cy + s * 0.3, cx + s * 1.15, cy - s * 0.15, cx + s * 0.95, cy - s * 0.5);
  ctx.bezierCurveTo(cx + s * 0.65, cy - s * 0.9, cx, cy - s * 0.7, cx, cy - s * 0.35);
  ctx.closePath();
}

function starPath(ctx, cx, cy, outerR) {
  const innerR = outerR * 0.42;
  const pts = 5;
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI / pts) * i - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function flowerPath(ctx, cx, cy, size) {
  const petals = 6;
  const petalR = size * 0.44;
  const dist = size * 0.42;
  ctx.beginPath();
  for (let i = 0; i < petals; i++) {
    const a = (Math.PI * 2 * i) / petals - Math.PI / 2;
    const px = cx + dist * Math.cos(a);
    const py = cy + dist * Math.sin(a);
    ctx.moveTo(px + petalR, py);
    ctx.arc(px, py, petalR, 0, Math.PI * 2);
  }
  // center disc
  ctx.moveTo(cx + size * 0.28, cy);
  ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
  ctx.closePath();
}

function drawShapePath(ctx, shape, cx, cy, size) {
  switch (shape) {
    case "heart":   heartPath(ctx, cx, cy, size);  break;
    case "star":    starPath(ctx, cx, cy, size);   break;
    case "flower":  flowerPath(ctx, cx, cy, size); break;
    default: break;
  }
}

// ── rounded rect helper ─────────────────────────────────────

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── QR module drawing (shared) ──────────────────────────────

function drawModules(ctx, modules, count, ox, oy, modSize, color) {
  ctx.fillStyle = color;
  const r = modSize * 0.15;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (modules.get(row, col)) {
        rrect(ctx, ox + col * modSize, oy + row * modSize, modSize, modSize, r);
        ctx.fill();
      }
    }
  }
}

// ── center heart icon ───────────────────────────────────────

function drawCenterHeart(ctx, cx, cy, size, color) {
  const hs = size * 0.06;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx, cy, hs * 0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `${hs}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText("❤️", cx, cy);
}

// ═════════════ public API ═══════════════════════════════════

/**
 * Generate QR with optional decorative shape frame.
 *
 * @param {string} text
 * @param {{ size?: number, color?: string, shape?: "square"|"heart"|"star"|"flower" }} opts
 * @returns {Promise<string>} PNG data-URL
 */
export async function generateShapedQR(
  text,
  { size = 600, color = "#e60023", shape = "square" } = {},
) {
  const segments = [{ data: text, mode: "byte" }];
  const code = QRCode.create(segments, { errorCorrectionLevel: "H" });
  const { modules } = code;
  const count = modules.size;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  if (shape === "square") {
    // ── simple square QR (original look) ──
    const pad = size * 0.05;
    const modSize = (size - pad * 2) / count;
    drawModules(ctx, modules, count, pad, pad, modSize, color);
    drawCenterHeart(ctx, cx, cy, size, color);
    return canvas.toDataURL("image/png");
  }

  // ── shaped frame QR ──
  const shapeR = size * 0.46;     // radius for the shape
  const qrArea = size * 0.58;     // side length of QR white area
  const qrOrig = (size - qrArea) / 2;

  // 1) draw coloured shape
  ctx.fillStyle = color;
  drawShapePath(ctx, shape, cx, cy, shapeR);
  ctx.fill();

  // 2) white QR background (with rounded corners)
  const bgPad = qrArea * 0.035;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#fff";
  rrect(ctx, qrOrig - bgPad, qrOrig - bgPad, qrArea + bgPad * 2, qrArea + bgPad * 2, 8);
  ctx.fill();
  ctx.restore();

  // 3) QR modules
  const modSize = qrArea / count;
  drawModules(ctx, modules, count, qrOrig, qrOrig, modSize, color);

  // 4) center heart
  drawCenterHeart(ctx, cx, cy, size, color);

  return canvas.toDataURL("image/png");
}

/**
 * Backward-compatible wrapper — generates a square QR (no frame).
 */
export async function generateHeartQR(
  text,
  { size = 512, color = "#e60023" } = {},
) {
  return generateShapedQR(text, { size, color, shape: "square" });
}
