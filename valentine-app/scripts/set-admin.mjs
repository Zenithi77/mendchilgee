/**
 * Set admin role for a user by email.
 * Usage: node set-admin.mjs <email>
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "serviceAccountKey.json"), "utf8")
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const auth = getAuth();

const email = process.argv[2];
if (!email) {
  console.error("Usage: node set-admin.mjs <email>");
  process.exit(1);
}

async function setAdmin(email) {
  // Find user by email
  const userRecord = await auth.getUserByEmail(email);
  console.log(`Found user: ${userRecord.uid} (${userRecord.email})`);

  // Set role to admin in userProfiles
  await db.collection("userProfiles").doc(userRecord.uid).set(
    { role: "admin" },
    { merge: true }
  );

  console.log(`✅ ${email} is now admin!`);
}

setAdmin(email).catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
