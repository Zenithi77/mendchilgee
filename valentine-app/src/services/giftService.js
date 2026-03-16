// ═══════════════════════════════════════════════════════════════
// Gift Service — Firestore CRUD for gifts collection
// ═══════════════════════════════════════════════════════════════

import {
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "gifts";

/**
 * Deep-sanitize an object for Firestore compatibility.
 * - Strips undefined values (Firestore rejects them)
 * - Converts NaN/Infinity to null
 * - Preserves arrays, nested objects, strings, numbers, booleans
 * - Removes functions / symbols
 */
function sanitizeForFirestore(obj) {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === "string" || typeof obj === "boolean") return obj;
  if (typeof obj === "number") {
    if (Number.isNaN(obj) || !Number.isFinite(obj)) return null;
    return obj;
  }
  if (typeof obj === "function" || typeof obj === "symbol") return undefined;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore).filter((v) => v !== undefined);
  }

  if (typeof obj === "object") {
    // Preserve Firestore Timestamps and special objects (they have toMillis, etc.)
    if (obj.toMillis || obj._methodName) return obj;

    const clean = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitized = sanitizeForFirestore(value);
      if (sanitized !== undefined) {
        clean[key] = sanitized;
      }
    }
    return clean;
  }

  return obj;
}

/**
 * Save a new gift to Firestore. Returns the generated document ID.
 */
export async function saveGift(gift, userId) {
  const raw = {
    ...gift,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  delete raw.id;

  // Deep-sanitize to prevent Firestore serialization issues
  const payload = sanitizeForFirestore(raw);
  // Re-apply server timestamps (sanitizer might not preserve sentinel values)
  payload.createdAt = serverTimestamp();
  payload.updatedAt = serverTimestamp();

  const docRef = await addDoc(collection(db, COLLECTION), payload);
  return docRef.id;
}

/**
 * Update an existing gift in Firestore.
 * Uses setDoc with merge to ensure ALL fields are written,
 * including deeply nested arrays like sections.
 */
export async function updateGift(giftId, gift) {
  const raw = { ...gift, updatedAt: serverTimestamp() };
  delete raw.id;

  // Deep-sanitize
  const payload = sanitizeForFirestore(raw);
  payload.updatedAt = serverTimestamp();

  // Use setDoc with merge: true to reliably write the entire document
  // This avoids updateDoc's issues with nested array replacement
  await setDoc(doc(db, COLLECTION, giftId), payload, { merge: true });
}

/**
 * Save or update: if the gift already has an id, update; otherwise create.
 * Returns the document ID.
 */
export async function saveOrUpdateGift(gift, userId) {
  if (gift.id) {
    await updateGift(gift.id, gift);
    return gift.id;
  }
  return saveGift(gift, userId);
}

/**
 * Get a single gift by document ID.
 */
export async function getGift(giftId) {
  const snap = await getDoc(doc(db, COLLECTION, giftId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Get all gifts for a specific user.
 */
export async function getUserGifts(userId) {
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Delete a gift by document ID.
 */
export async function deleteGift(giftId) {
  await deleteDoc(doc(db, COLLECTION, giftId));
}

/**
 * Increment the view counter for a gift.
 * Called when a recipient opens the gift preview page.
 */
export async function incrementViewCount(giftId) {
  try {
    await updateDoc(doc(db, COLLECTION, giftId), {
      viewCount: increment(1),
      lastViewedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Failed to increment view count:", err);
  }
}
