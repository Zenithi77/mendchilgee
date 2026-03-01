// ═══════════════════════════════════════════════════════════════
// Gift Service — Firestore CRUD for gifts collection
// ═══════════════════════════════════════════════════════════════

import {
  collection,
  doc,
  addDoc,
  getDoc,
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
 * Save a new gift to Firestore. Returns the generated document ID.
 */
export async function saveGift(gift, userId) {
  const payload = {
    ...gift,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  // Remove the local `id` field (Firestore manages the doc ID)
  delete payload.id;

  const docRef = await addDoc(collection(db, COLLECTION), payload);
  return docRef.id;
}

/**
 * Update an existing gift in Firestore.
 */
export async function updateGift(giftId, gift) {
  const payload = { ...gift, updatedAt: serverTimestamp() };
  delete payload.id; // Don't store the doc ID inside the document
  await updateDoc(doc(db, COLLECTION, giftId), payload);
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
