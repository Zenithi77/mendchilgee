// ═══════════════════════════════════════════════════════════════
// Gift Response Service — Firestore CRUD for giftResponses
// Stores the latest response/choices per giftId.
// ═══════════════════════════════════════════════════════════════

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "giftResponses";

export async function saveGiftResponse(giftId, choices) {
  if (!giftId) throw new Error("giftId is required");
  await setDoc(
    doc(db, COLLECTION, String(giftId)),
    {
      giftId: String(giftId),
      choices: choices || {},
      respondedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getGiftResponse(giftId) {
  if (!giftId) return null;
  const snap = await getDoc(doc(db, COLLECTION, String(giftId)));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
