// ═══════════════════════════════════════════════════════════════
// Credit Service — Manage user credits, promo codes, QPay purchases
// ═══════════════════════════════════════════════════════════════

import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

// ── Credits ──────────────────────────────────────────────────

/**
 * Subscribe to user credits in real-time.
 * Returns an unsubscribe function.
 */
export function subscribeToCredits(userId, callback) {
  return onSnapshot(doc(db, "userProfiles", userId), (snap) => {
    if (snap.exists()) {
      callback(snap.data().credits || 0);
    } else {
      callback(0);
    }
  });
}

/**
 * Get user credits once.
 */
export async function getUserCredits(userId) {
  const snap = await getDoc(doc(db, "userProfiles", userId));
  if (snap.exists()) return snap.data().credits || 0;
  return 0;
}

/**
 * Initialize user profile if it doesn't exist.
 */
export async function ensureUserProfile(userId) {
  const ref = doc(db, "userProfiles", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { credits: 0 }, { merge: true });
  }
}

// ── Promo Codes ──────────────────────────────────────────────

/**
 * Redeem a promo code via cloud function.
 * Returns { success: true, newCredits: number } on success.
 * Throws Error with Mongolian message on failure.
 */
export async function redeemPromoCode(code, userId) {
  const res = await fetch(`${FUNCTIONS_BASE}/redeemPromoCode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, userId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Промо код алдаатай байна");
  }
  return data;
}

// ── QPay Purchases ───────────────────────────────────────────

/**
 * Create a QPay invoice for purchasing credits.
 * Returns { invoiceNo, qrImage, qrText, urls, amount }
 */
export async function createQPayInvoice(userId, quantity = 1) {
  const res = await fetch(`${FUNCTIONS_BASE}/createQPayInvoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, quantity }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Төлбөр үүсгэхэд алдаа гарлаа");
  }
  return data;
}

/**
 * Check QPay payment status.
 * Returns { status: "pending"|"paid", quantity, amount }
 */
export async function checkQPayPayment(invoiceNo) {
  const res = await fetch(
    `${FUNCTIONS_BASE}/checkQPayPayment?invoiceNo=${encodeURIComponent(invoiceNo)}`,
  );
  const data = await res.json();
  return data;
}

// ── Credit Consumption ───────────────────────────────────────

/**
 * Use 1 credit to activate a gift (remove watermark).
 * Returns { success: true, remainingCredits: number }
 */
export async function useCredit(userId, giftId) {
  const res = await fetch(`${FUNCTIONS_BASE}/useCredit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, giftId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Эрх ашиглахад алдаа гарлаа");
  }
  return data;
}
