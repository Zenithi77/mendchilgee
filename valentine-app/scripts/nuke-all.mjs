#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * NUKE SCRIPT — Delete ALL Cloudinary assets + Firestore greetings
 *
 * 1. Deletes ALL images from Cloudinary
 * 2. Deletes ALL videos from Cloudinary
 * 3. Deletes ALL docs in "gifts" collection
 * 4. Deletes ALL docs in "giftResponses" collection
 * ═══════════════════════════════════════════════════════════════
 */

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Cloudinary Config ───────────────────────────────────────
const CLOUD_NAME  = "dstwyxjpx";
const API_KEY     = "732737488855987";
const API_SECRET  = "yKsESsho189wKFjuVSF2PxiR6rc";

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

// ── Cloudinary API Helper ───────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cloudinaryRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
    const bodyStr = body ? JSON.stringify(body) : null;

    const options = {
      hostname: "api.cloudinary.com",
      path: `/v1_1/${CLOUD_NAME}${path}`,
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    };
    if (bodyStr) options.headers["Content-Length"] = Buffer.byteLength(bodyStr);

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ── Delete all Cloudinary resources of a given type ─────────

async function deleteAllCloudinaryResources(resourceType) {
  console.log(`☁️  Deleting all Cloudinary ${resourceType}s...`);
  let nextCursor = null;
  let totalDeleted = 0;

  do {
    // List up to 500 resources
    let path = `/resources/${resourceType}?max_results=500`;
    if (nextCursor) path += `&next_cursor=${encodeURIComponent(nextCursor)}`;

    const listRes = await cloudinaryRequest("GET", path);

    if (listRes.status !== 200) {
      console.error(`  ❌ Failed to list ${resourceType}s:`, listRes.body);
      break;
    }

    const resources = listRes.body.resources || [];
    if (resources.length === 0) {
      console.log(`  ✅ No more ${resourceType}s to delete.`);
      break;
    }

    const publicIds = resources.map((r) => r.public_id);
    console.log(`  📦 Found ${publicIds.length} ${resourceType}(s), deleting...`);

    // Delete in chunks of 100 (Cloudinary limit per request)
    for (let i = 0; i < publicIds.length; i += 100) {
      const chunk = publicIds.slice(i, i + 100);
      const delRes = await cloudinaryRequest("DELETE", `/resources/${resourceType}/upload`, {
        public_ids: chunk,
      });

      if (delRes.status === 200) {
        const deleted = Object.values(delRes.body.deleted || {}).filter(
          (v) => v === "deleted"
        ).length;
        totalDeleted += deleted;
        console.log(`  🗑️  Deleted ${deleted} ${resourceType}(s) (batch ${Math.floor(i / 100) + 1})`);
      } else if (delRes.status === 420 || delRes.status === 429) {
        console.log(`  ⏳ Rate limited, waiting 10s...`);
        await sleep(10000);
        i -= 100; // retry same batch
        continue;
      } else {
        console.error(`  ❌ Delete failed (${delRes.status}):`, delRes.body);
      }
      // Small delay between batches to avoid rate limits
      await sleep(500);
    }

    nextCursor = listRes.body.next_cursor || null;
  } while (nextCursor);

  console.log(`  ✅ Total ${resourceType}s deleted: ${totalDeleted}\n`);
  return totalDeleted;
}

// ── Delete Firestore collection ─────────────────────────────

async function deleteCollection(collectionName) {
  const snap = await db.collection(collectionName).get();
  const total = snap.size;

  if (total === 0) {
    console.log(`  ✅ ${collectionName}: 0 docs (already empty)`);
    return 0;
  }

  const batchSize = 400;
  let deleted = 0;

  for (let i = 0; i < snap.docs.length; i += batchSize) {
    const batch = db.batch();
    const chunk = snap.docs.slice(i, i + batchSize);
    chunk.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += chunk.length;
    console.log(`  🗑️  ${collectionName}: ${deleted}/${total} deleted...`);
  }

  console.log(`  ✅ ${collectionName}: ${deleted} docs deleted`);
  return deleted;
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  console.log("══════════════════════════════════════════════════");
  console.log("  NUKE ALL — Cloudinary assets + Firestore gifts  ");
  console.log("══════════════════════════════════════════════════\n");

  // 1. Delete Cloudinary images
  const imgCount = await deleteAllCloudinaryResources("image");

  // 2. Delete Cloudinary videos
  const vidCount = await deleteAllCloudinaryResources("video");

  // 3. Delete Cloudinary raw files (if any)
  const rawCount = await deleteAllCloudinaryResources("raw");

  // 4. Delete Firestore collections
  console.log("🗄️  Deleting Firestore collections...\n");
  const giftsDeleted = await deleteCollection("gifts");
  const responsesDeleted = await deleteCollection("giftResponses");

  console.log("\n══════════════════════════════════════════════════");
  console.log("  DONE!");
  console.log(`  Cloudinary: ${imgCount} images, ${vidCount} videos, ${rawCount} raw files deleted`);
  console.log(`  Firestore:  ${giftsDeleted} gifts, ${responsesDeleted} giftResponses deleted`);
  console.log("══════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
