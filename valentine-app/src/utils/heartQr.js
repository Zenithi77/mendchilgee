// ═══════════════════════════════════════════════════════════════
// Shaped QR Code Generator
// ═══════════════════════════════════════════════════════════════
//
// Generates QR codes clipped to decorative shapes:
//   "heart"  — modules inside a heart boundary, heart finder-patterns
//   "circle" — modules inside a circle
//   "star"   — modules inside a 5-point star
//   "square" — standard square QR
//
// All non-square shapes use error-correction level H (30%)
// so clipped edges remain scannable.
// ═══════════════════════════════════════════════════════════════

import QRCode from "qrcode";

// ── public shape list (for UI pickers) ──────────────────────

export const QR_SHAPES = [
  { id: "heart",  label: "❤️ Зүрх",     defaultColor: "#e60023" },
  { id: "circle", label: "⭕ Тойрог",   defaultColor: "#e60023" },
  { id: "star",   label: "⭐ Од",       defaultColor: "#e60023" },
  { id: "square", label: "⬜ Дөрвөлжин", defaultColor: "#1a0e12" },
];

// ── shape path helpers ──────────────────────────────────────

function heartPath(ctx, cx, cy, s) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.35);
  ctx.bezierCurveTo(
    cx,            cy - s * 0.7,
    cx - s * 0.65, cy - s * 0.9,
    cx - s * 0.95, cy - s * 0.5,
  );
  ctx.bezierCurveTo(
    cx - s * 1.15, cy - s * 0.15,
    cx - s * 0.7,  cy + s * 0.3,
    cx,            cy + s * 0.85,
  );
  ctx.bezierCurveTo(
    cx + s * 0.7,  cy + s * 0.3,
    cx + s * 1.15, cy - s * 0.15,
    cx + s * 0.95, cy - s * 0.5,
  );
  ctx.bezierCurveTo(
    cx + s * 0.65, cy - s * 0.9,
    cx,            cy - s * 0.7,
    cx,            cy - s * 0.35,
  );
  ctx.closePath();
}

function circlePath(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
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

function drawClipShape(ctx, shape, cx, cy, s) {
  switch (shape) {
    case "heart":  heartPath(ctx, cx, cy, s);  break;
    case "circle": circlePath(ctx, cx, cy, s); break;
    case "star":   starPath(ctx, cx, cy, s);   break;
    default: break;
  }
}

// ── finder-pattern helpers ──────────────────────────────────

/** Returns true if (row, col) is inside one of the 3 finder
    patterns OR its 1-module separator ring. */
function isFinderZone(row, col, count) {
  if (row <= 7 && col <= 7) return true;           // top-left
  if (row <= 7 && col >= count - 8) return true;    // top-right
  if (row >= count - 8 && col <= 7) return true;    // bottom-left
  return false;
}

/** Draw a 7×7 finder with a ❤ icon in the centre. */
function drawHeartFinder(ctx, x, y, modSize, color) {
  const s7 = modSize * 7;
  const m = modSize;

  // outer ring (dark)
  ctx.fillStyle = color;
  ctx.fillRect(x, y, s7, s7);

  // middle ring (white)
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + m, y + m, s7 - 2 * m, s7 - 2 * m);

  // centre heart
  const fcx = x + s7 / 2;
  const fcy = y + s7 / 2;
  ctx.fillStyle = color;
  heartPath(ctx, fcx, fcy, m * 1.4);
  ctx.fill();
}

/** Draw a standard 7×7 finder (outer–white–inner). */
function drawStdFinder(ctx, x, y, modSize, color) {
  const s7 = modSize * 7;
  const m = modSize;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, s7, s7);
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + m, y + m, s7 - 2 * m, s7 - 2 * m);
  ctx.fillStyle = color;
  ctx.fillRect(x + 2 * m, y + 2 * m, s7 - 4 * m, s7 - 4 * m);
}

// ── centre icon ─────────────────────────────────────────────

function drawCenterHeart(ctx, cx, cy, radius, color) {
  // white disc
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  // heart
  ctx.fillStyle = color;
  heartPath(ctx, cx, cy, radius * 0.55);
  ctx.fill();
}

// ── rounded rect ────────────────────────────────────────────

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

// ═════════════ public API ═══════════════════════════════════

/**
 * Generate a QR code rendered inside a decorative shape.
 *
 * @param {string} text  — the URL / text to encode
 * @param {{ size?: number, color?: string,
 *           shape?: "heart"|"circle"|"star"|"square" }} opts
 * @returns {Promise<string>} PNG data-URL
 */
export async function generateShapedQR(
  text,
  { size = 600, color = "#e60023", shape = "heart" } = {},
) {
  const qr = QRCode.create([{ data: text, mode: "byte" }], {
    errorCorrectionLevel: "H",
  });
  const { modules } = qr;
  const count = modules.size;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // ── square: standard rectangular QR ──
  if (shape === "square") {
    const pad = size * 0.05;
    const modSize = (size - pad * 2) / count;
    const r = modSize * 0.12;

    ctx.fillStyle = color;
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (modules.get(row, col)) {
          rrect(ctx, pad + col * modSize, pad + row * modSize, modSize, modSize, r);
          ctx.fill();
        }
      }
    }
    drawCenterHeart(ctx, cx, cy, size * 0.06, color);
    return canvas.toDataURL("image/png");
  }

  // ── shaped QR (heart / circle / star) ──

  // QR grid sizing — star needs smaller ratio (concave shape)
  const qrRatio = shape === "star" ? 0.52 : 0.58;
  const modSize = (size * qrRatio) / count;
  const qrSide = modSize * count;

  const offsetX = (size - qrSide) / 2;
  // shift QR up slightly for heart (heart top extends further than bottom)
  const offsetY =
    shape === "heart"
      ? (size - qrSide) / 2 - size * 0.025
      : (size - qrSide) / 2;

  // clip shape scale
  const shapeScale = shape === "star" ? size * 0.48 : size * 0.46;
  const shapeCy = shape === "heart" ? cy - size * 0.01 : cy;

  // 1) clip to shape boundary
  ctx.save();
  drawClipShape(ctx, shape, cx, shapeCy, shapeScale);
  ctx.clip();

  // 2) white fill inside shape
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // 3) draw data modules (skip finder zones — we draw those separately)
  ctx.fillStyle = color;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (modules.get(row, col) && !isFinderZone(row, col, count)) {
        ctx.fillRect(
          offsetX + col * modSize,
          offsetY + row * modSize,
          modSize * 0.88,
          modSize * 0.88,
        );
      }
    }
  }

  // 4) draw custom finder patterns
  const useHeartFinders = shape === "heart";
  const drawFinder = useHeartFinders ? drawHeartFinder : drawStdFinder;

  const finders = [
    [0, 0],             // top-left
    [0, count - 7],     // top-right
    [count - 7, 0],     // bottom-left
  ];
  for (const [fr, fc] of finders) {
    drawFinder(
      ctx,
      offsetX + fc * modSize,
      offsetY + fr * modSize,
      modSize,
      color,
    );
  }

  // 5) centre heart icon
  const centerR = modSize * 2.5;
  const qrCy = offsetY + qrSide / 2;
  drawCenterHeart(ctx, cx, qrCy, centerR, color);

  ctx.restore();

  return canvas.toDataURL("image/png");
}

/**
 * Backward-compatible wrapper — default heart shape.
 */
export async function generateHeartQR(
  text,
  { size = 512, color = "#e60023" } = {},
) {
  return generateShapedQR(text, { size, color, shape: "heart" });
}
