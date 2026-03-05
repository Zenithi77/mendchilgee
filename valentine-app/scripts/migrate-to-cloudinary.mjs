#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * Firebase Storage → Cloudinary Migration Script
 *
 * Reads ALL gift documents from Firestore, finds Firebase Storage
 * URLs in sections (memoryGallery images, memoryVideo videos),
 * downloads each file, re-uploads to Cloudinary, and updates
 * the Firestore document with the new URL.
 *
 * Usage:
 *   1. Place your Firebase service account key as:
 *      scripts/serviceAccountKey.json
 *   2. Run:  node scripts/migrate-to-cloudinary.mjs
 *   3. Add --dry-run to preview without writing:
 *            node scripts/migrate-to-cloudinary.mjs --dry-run
 * ═══════════════════════════════════════════════════════════════
 */

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────
const CLOUD_NAME = "dstwyxjpx";
const UPLOAD_PRESET = "mendchilgee";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;
const DRY_RUN = process.argv.includes("--dry-run");
const CONCURRENCY = 3; // parallel uploads at a time

// ── Firebase Admin Init ─────────────────────────────────────
// Try service account key first, fall back to Application Default Credentials
const saPath = resolve(__dirname, "serviceAccountKey.json");
let credential;
try {
  const serviceAccount = JSON.parse(readFileSync(saPath, "utf8"));
  credential = cert(serviceAccount);
  console.log("🔑 Using service account key\n");
} catch {
  // Use Application Default Credentials (firebase login)
  credential = applicationDefault();
  console.log("🔑 Using Application Default Credentials (firebase login)\n");
}

initializeApp({
  credential,
  projectId: "valentine-59463",
});
const db = getFirestore();

// ── Helpers ─────────────────────────────────────────────────

/** Check if a URL is a Firebase Storage URL */
function isFirebaseStorageUrl(url) {
  if (!url || typeof url !== "string") return false;
  return (
    url.includes("firebasestorage.googleapis.com") ||
    url.includes("storage.googleapis.com")
  );
}

/** Download a file from URL as a Buffer */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { headers: { "User-Agent": "MendchilgeeMigration/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed: ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

/** Detect resource type from URL */
function detectResourceType(url) {
  const lower = url.toLowerCase();
  if (/\.(mp4|mov|avi|webm|mkv|m4v)/.test(lower)) return "video";
  return "image";
}

/** Upload a buffer to Cloudinary */
function uploadToCloudinary(buffer, resourceType, folder) {
  return new Promise((resolve, reject) => {
    const base64 = `data:${resourceType === "video" ? "video/mp4" : "image/png"};base64,${buffer.toString("base64")}`;

    // Use public_id with underscores (no slashes) + asset_folder for organization
    const publicId = folder.replace(/\//g, "_") + "_" + Date.now();

    const body = JSON.stringify({
      file: base64,
      upload_preset: UPLOAD_PRESET,
      public_id: publicId,
      asset_folder: folder,
    });

    const urlObj = new URL(`${CLOUDINARY_UPLOAD_URL}/${resourceType}/upload`);

    const req = https.request(
      {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString();
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const data = JSON.parse(text);
            resolve(data.secure_url);
          } else {
            reject(new Error(`Cloudinary upload failed (${res.statusCode}): ${text.slice(0, 200)}`));
          }
        });
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/** Migrate a single Firebase Storage URL to Cloudinary */
async function migrateUrl(url, folder) {
  if (!isFirebaseStorageUrl(url)) return url;

  const resourceType = detectResourceType(url);
  console.log(`   📥 Downloading (${resourceType}): ${url.slice(0, 80)}...`);

  const buffer = await downloadFile(url);
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
  console.log(`   📦 Size: ${sizeMB} MB`);

  console.log(`   📤 Uploading to Cloudinary (${folder})...`);
  const newUrl = await uploadToCloudinary(buffer, resourceType, folder);
  console.log(`   ✅ New URL: ${newUrl.slice(0, 80)}...`);

  return newUrl;
}

/** Process items in parallel with a concurrency limit */
async function parallelMap(items, fn, limit = CONCURRENCY) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ── Main Migration ──────────────────────────────────────────

async function migrate() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Firebase Storage → Cloudinary Migration");
  console.log(`  Mode: ${DRY_RUN ? "🔍 DRY RUN (no writes)" : "🚀 LIVE"}`);
  console.log("═══════════════════════════════════════════════════\n");

  // Fetch all gifts
  console.log("📂 Fetching all gifts from Firestore...");
  const giftsSnap = await db.collection("gifts").get();
  console.log(`   Found ${giftsSnap.size} gifts\n`);

  let totalUrls = 0;
  let migratedUrls = 0;
  let failedUrls = 0;
  let skippedUrls = 0;
  let updatedDocs = 0;

  for (const doc of giftsSnap.docs) {
    const gift = doc.data();
    const giftId = doc.id;
    const userId = gift.userId || "unknown";
    const sections = gift.sections || [];

    // Find all Firebase Storage URLs in this gift
    let hasFirebaseUrls = false;
    const urlLocations = []; // { sectionIdx, field, itemIdx }

    sections.forEach((section, sIdx) => {
      const data = section.data || {};

      // Memory Gallery images
      if (section.type === "memoryGallery" && Array.isArray(data.images)) {
        data.images.forEach((img, iIdx) => {
          if (isFirebaseStorageUrl(img.src)) {
            urlLocations.push({ sectionIdx: sIdx, field: "images", itemIdx: iIdx, url: img.src });
            hasFirebaseUrls = true;
          }
        });
      }

      // Memory Video videos
      if (section.type === "memoryVideo" && Array.isArray(data.videos)) {
        data.videos.forEach((vid, vIdx) => {
          if (isFirebaseStorageUrl(vid.src)) {
            urlLocations.push({ sectionIdx: sIdx, field: "videos", itemIdx: vIdx, url: vid.src });
            hasFirebaseUrls = true;
          }
        });
      }

      // Also check for any other fields that might have Firebase URLs
      // (welcome background, etc.)
      for (const [key, val] of Object.entries(data)) {
        if (typeof val === "string" && isFirebaseStorageUrl(val) && key !== "images" && key !== "videos") {
          urlLocations.push({ sectionIdx: sIdx, field: key, itemIdx: -1, url: val });
          hasFirebaseUrls = true;
        }
      }
    });

    if (!hasFirebaseUrls) {
      continue;
    }

    totalUrls += urlLocations.length;
    console.log(`\n🎁 Gift: ${giftId} (user: ${userId}) — ${urlLocations.length} Firebase URL(s)`);

    if (DRY_RUN) {
      urlLocations.forEach((loc) => {
        console.log(`   [DRY] Would migrate: section[${loc.sectionIdx}].data.${loc.field}[${loc.itemIdx}]`);
        console.log(`         ${loc.url.slice(0, 100)}...`);
      });
      skippedUrls += urlLocations.length;
      continue;
    }

    // Migrate each URL
    const updatedSections = JSON.parse(JSON.stringify(sections)); // deep clone
    let docChanged = false;

    for (const loc of urlLocations) {
      const folder =
        loc.field === "videos"
          ? `mendchilgee/videos/${userId}`
          : `mendchilgee/memories/${userId}`;

      try {
        const newUrl = await migrateUrl(loc.url, folder);

        if (loc.itemIdx >= 0) {
          updatedSections[loc.sectionIdx].data[loc.field][loc.itemIdx].src = newUrl;
        } else {
          updatedSections[loc.sectionIdx].data[loc.field] = newUrl;
        }

        docChanged = true;
        migratedUrls++;
      } catch (err) {
        console.error(`   ❌ FAILED: ${err.message}`);
        failedUrls++;
      }
    }

    // Update Firestore document
    if (docChanged) {
      console.log(`   💾 Updating Firestore document...`);
      await db.collection("gifts").doc(giftId).update({ sections: updatedSections });
      updatedDocs++;
      console.log(`   ✅ Document updated!`);
    }
  }

  // ── Summary ──
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Migration Complete!");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Total Firebase URLs found: ${totalUrls}`);
  if (DRY_RUN) {
    console.log(`  Skipped (dry run):         ${skippedUrls}`);
  } else {
    console.log(`  Successfully migrated:     ${migratedUrls}`);
    console.log(`  Failed:                    ${failedUrls}`);
    console.log(`  Documents updated:         ${updatedDocs}`);
  }
  console.log("═══════════════════════════════════════════════════\n");
}

migrate().catch((err) => {
  console.error("💥 Migration error:", err);
  process.exit(1);
});
