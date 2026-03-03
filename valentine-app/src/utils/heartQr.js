// ═══════════════════════════════════════════════════════════════
// Shaped QR Code Generator
// ═══════════════════════════════════════════════════════════════
//
// Generates QR codes rendered inside decorative shapes.
//
// Approach:
//   1. Find the largest inscribed square within the shape
//   2. Render the real QR code in that square
//   3. Fill remaining shape area with QR-style decorative dots
//   4. Clip everything to the shape boundary
//
// Supported shapes: heart, circle, star, flower, square
// Non-square shapes use error-correction level H (30%)
// ═══════════════════════════════════════════════════════════════

import QRCode from "qrcode";

// ── public shape list (for UI pickers) ──────────────────────

export const QR_SHAPES = [
  { id: "heart",  label: "❤️ Зүрх",     defaultColor: "#e60023" },
  { id: "circle", label: "⭕ Тойрог",   defaultColor: "#e60023" },
  { id: "star",   label: "⭐ Од",       defaultColor: "#e60023" },
  { id: "flower", label: "🌸 Цэцэг",   defaultColor: "#e60023" },
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

function flowerPath(ctx, cx, cy, r) {
  const petals = 6;
  const petalR = r * 0.52;
  const petalDist = r * 0.52;
  ctx.beginPath();
  for (let i = 0; i < petals; i++) {
    const a = (Math.PI * 2 / petals) * i - Math.PI / 2;
    const px = cx + petalDist * Math.cos(a);
    const py = cy + petalDist * Math.sin(a);
    ctx.moveTo(px + petalR, py);
    ctx.arc(px, py, petalR, 0, Math.PI * 2);
  }
  // center disc
  ctx.moveTo(cx + petalR * 0.55, cy);
  ctx.arc(cx, cy, petalR * 0.55, 0, Math.PI * 2);
  ctx.closePath();
}

function drawClipShape(ctx, shape, cx, cy, s) {
  switch (shape) {
    case "heart":  heartPath(ctx, cx, cy, s);  break;
    case "circle": circlePath(ctx, cx, cy, s); break;
    case "star":   starPath(ctx, cx, cy, s);   break;
    case "flower": flowerPath(ctx, cx, cy, s); break;
    default: break;
  }
}

// ── inscribed square for each shape ─────────────────────────

function getInscribedSquare(shape, cx, cy, scale) {
  switch (shape) {
    case "heart": {
      const side = scale * 1.0;
      return { x: cx - side / 2, y: cy - side / 2 + scale * 0.06, side };
    }
    case "circle": {
      const side = scale * Math.SQRT2 * 0.96;
      return { x: cx - side / 2, y: cy - side / 2, side };
    }
    case "star": {
      const side = scale * 0.42 * Math.SQRT2 * 0.88;
      return { x: cx - side / 2, y: cy - side / 2, side };
    }
    case "flower": {
      const side = scale * 0.7;
      return { x: cx - side / 2, y: cy - side / 2, side };
    }
    default:
      return null;
  }
}

// ── deterministic hash for decorative fill ──────────────────

function fillHash(col, row) {
  return ((col * 2654435761) ^ (row * 2246822519)) >>> 0;
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
 * The real QR sits in the largest inscribed square within the shape.
 * Remaining shape area is filled with QR-style decorative dots.
 * Everything is clipped to the shape boundary — nothing leaks out.
 *
 * @param {string} text  — the URL / text to encode
 * @param {{ size?: number, color?: string,
 *           shape?: "heart"|"circle"|"star"|"flower"|"square" }} opts
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
    return canvas.toDataURL("image/png");
  }

  // ── shaped QR (heart / circle / star / flower) ──

  const shapeScale = size * 0.47;
  const shapeCy = shape === "heart" ? cy - size * 0.01 : cy;

  // 1) Inscribed square & module size
  const inscribed = getInscribedSquare(shape, cx, shapeCy, shapeScale);
  const modSize = inscribed.side / count;
  const qrX = inscribed.x;
  const qrY = inscribed.y;

  // 2) Extended grid to cover full canvas
  const gridColStart = Math.floor(-qrX / modSize) - 1;
  const gridColEnd = Math.ceil((size - qrX) / modSize) + 1;
  const gridRowStart = Math.floor(-qrY / modSize) - 1;
  const gridRowEnd = Math.ceil((size - qrY) / modSize) + 1;

  // 3) Clip to shape
  ctx.save();
  drawClipShape(ctx, shape, cx, shapeCy, shapeScale);
  ctx.clip();

  // 4) White fill inside shape
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // 5) Draw modules (real QR + decorative fill)
  const mDraw = modSize * 0.88;
  const rr = modSize * 0.1;

  ctx.fillStyle = color;
  for (let row = gridRowStart; row < gridRowEnd; row++) {
    for (let col = gridColStart; col < gridColEnd; col++) {
      const px = qrX + col * modSize;
      const py = qrY + row * modSize;

      const inQR = row >= 0 && row < count && col >= 0 && col < count;

      let draw = false;
      if (inQR) {
        // Real QR data (skip finder zones — drawn separately below)
        if (!isFinderZone(row, col, count)) {
          draw = modules.get(row, col);
        }
      } else {
        // Decorative fill: ~42% density, looks like QR data
        draw = fillHash(col + 500, row + 500) % 100 < 42;
      }

      if (draw) {
        rrect(ctx, px, py, mDraw, mDraw, rr);
        ctx.fill();
      }
    }
  }

  // 6) Draw finder patterns (cleanly on top)
  const drawFinder = shape === "heart" ? drawHeartFinder : drawStdFinder;
  const finders = [
    [0, 0],
    [0, count - 7],
    [count - 7, 0],
  ];
  for (const [fr, fc] of finders) {
    drawFinder(ctx, qrX + fc * modSize, qrY + fr * modSize, modSize, color);
  }

  // 7) Centre heart icon
  const centerR = modSize * 2.5;
  const qrCenterY = qrY + inscribed.side / 2;
  drawCenterHeart(ctx, cx, qrCenterY, centerR, color);

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
