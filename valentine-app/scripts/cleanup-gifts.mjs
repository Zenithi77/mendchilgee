#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * Cleanup Script — Delete all gifts + giftResponses from Firestore
 *
 * Keeps: userProfiles, promoCodes, credit_payments, demo_payments
 * Deletes: gifts (all docs), giftResponses (all docs)
 *
 * Also lists Cloudinary URLs found in gifts so you can delete
 * them from your Cloudinary dashboard.
 *
 * Usage:
 *   node scripts/cleanup-gifts.mjs --dry-run    (preview only)
 *   node scripts/cleanup-gifts.mjs              (actually delete)
 * ═══════════════════════════════════════════════════════════════
 */

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

// ── Firebase Admin Init ─────────────────────────────────────
const saPath = resolve(__dirname, "serviceAccountKey.json");
let credential;
try {
  const sa = JSON.parse(readFileSync(saPath, "utf8"));
  credential = cert(sa);
  console.log("🔑 Service account key loaded\n");
} catch {
  credential = applicationDefault();
  console.log("🔑 Using Application Default Credentials\n");
}

initializeApp({ credential, projectId: "valentine-59463" });
const db = getFirestore();

// ── Helpers ─────────────────────────────────────────────────

/** Collect all Cloudinary URLs from a gift document */
function extractCloudinaryUrls(gift) {
  const urls = [];

  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    for (const [, val] of Object.entries(obj)) {
      if (typeof val === "string" && val.includes("cloudinary.com")) {
        urls.push(val);
      } else if (typeof val === "object") {
        walk(val);
      }
    }
  }

  walk(gift);
  return urls;
}

/** Delete all docs in a collection using batched writes */
async function deleteCollection(collectionName) {
  const snap = await db.collection(collectionName).get();
  const total = snap.size;

  if (total === 0) {
    console.log(`  ✅ ${collectionName}: алга (0 doc)`);
    return 0;
  }

  if (DRY_RUN) {
    console.log(`  🔍 ${collectionName}: ${total} doc устгагдана (dry-run)`);
    return total;
  }

  // Firestore batch supports max 500 operations
  const batchSize = 400;
  let deleted = 0;

  for (let i = 0; i < snap.docs.length; i += batchSize) {
    const batch = db.batch();
    const chunk = snap.docs.slice(i, i + batchSize);
    chunk.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += chunk.length;
    console.log(`  🗑️  ${collectionName}: ${deleted}/${total} устгасан...`);
  }

  console.log(`  ✅ ${collectionName}: ${deleted} doc устгагдлаа`);
  return deleted;
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  console.log(DRY_RUN ? "══ DRY RUN MODE ══\n" : "══ LIVE DELETE MODE ══\n");

  // Step 1: Collect Cloudinary URLs from all gifts
  console.log("📦 Gifts collection-оос Cloudinary URL-уудыг цуглуулж байна...");
  const giftsSnap = await db.collection("gifts").get();
  const allCloudinaryUrls = [];

  giftsSnap.docs.forEach((doc) => {
    const gift = doc.data();
    const urls = extractCloudinaryUrls(gift);
    if (urls.length > 0) {
      allCloudinaryUrls.push({ giftId: doc.id, urls });
    }
  });

  const totalUrls = allCloudinaryUrls.reduce((sum, g) => sum + g.urls.length, 0);
  console.log(`  📷 Нийт ${totalUrls} Cloudinary URL олдлоо (${allCloudinaryUrls.length} gift-ээс)\n`);

  // Save URLs to a file for manual Cloudinary cleanup
  if (totalUrls > 0) {
    const urlList = allCloudinaryUrls.flatMap((g) =>
      g.urls.map((u) => `${g.giftId}: ${u}`)
    );
    const outPath = resolve(__dirname, "cloudinary-urls-to-delete.txt");
    writeFileSync(outPath, urlList.join("\n"), "utf8");
    console.log(`  📝 URL-ууд ${outPath} файлд хадгалагдлаа\n`);
    console.log(`  ⚠️  Cloudinary dashboard-аас mendchilgee/ фолдер дотроос`);
    console.log(`     бүх зураг/видео гараар устгана уу!\n`);
  }

  // Step 2: Delete Firestore collections
  console.log("🗄️  Firestore collection-уудыг устгаж байна...\n");

  let totalDeleted = 0;
  totalDeleted += await deleteCollection("gifts");
  totalDeleted += await deleteCollection("giftResponses");

  console.log(`\n${"═".repeat(50)}`);
  if (DRY_RUN) {
    console.log(`✨ DRY RUN дууслаа. Нийт ${totalDeleted} doc устгагдах байсан.`);
    console.log("Жинхэнэ устгахын тулд: node scripts/cleanup-gifts.mjs");
  } else {
    console.log(`✅ Дууслаа! Нийт ${totalDeleted} doc устгагдлаа.`);
    console.log("👤 userProfiles хэвээр үлдсэн.");
    console.log("💳 credit_payments, promoCodes хэвээр үлдсэн.");
  }
  if (totalUrls > 0) {
    console.log(`\n⚠️  Cloudinary дээрх ${totalUrls} файл гараар устгах шаардлагатай!`);
    console.log("   → https://console.cloudinary.com/console/media_library");
    console.log("   → mendchilgee/ фолдерийг устгана уу");
  }
}

main().catch((err) => {
  console.error("❌ Алдаа:", err);
  process.exit(1);
});
