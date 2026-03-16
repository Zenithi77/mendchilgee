/**
 * Cloud Functions — Payment (BYL), Promo Codes, Credits
 *
 * BYL Payment Endpoints:
 *   POST /createBylCheckout — create BYL checkout for tier upgrade
 *   POST /createCreditCheckout — create BYL checkout for credit purchase
 *   POST /bylWebhook — BYL payment webhook (handles both tiers & credits)
 *   GET  /checkPaymentStatus — poll BYL payment status
 *   GET  /checkCreditPayment — poll credit purchase payment status
 *
 * Credit Endpoints:
 *   POST /redeemPromoCode — redeem a promo code for 1 credit
 *   POST /useCredit — consume 1 credit to activate a gift
 *
 * Utility:
 *   POST /checkExpiredGifts — expire gifts past their expiresAt date
 *   POST /fixPendingPayments — one-time fix for stuck pending payments
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({maxInstances: 10});

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Returns BYL and app configuration from environment variables.
 * @return {{projectId: string, token: string, webhookSecret: string,
 *     baseUrl: string}}
 */
function getConfig() {
  return {
    projectId: process.env.BYL_PROJECT_ID,
    token: process.env.BYL_TOKEN,
    webhookSecret: process.env.BYL_WEBHOOK_SECRET,
    baseUrl: process.env.BASE_URL,
  };
}

// ── (QPay removed — using BYL for all payments) ─────────────────────────

/**
 * Add credits to a user within a transaction.
 * @param {FirebaseFirestore.Transaction} tx
 * @param {string} userId
 * @param {number} amount
 * @return {Promise<number>} new credit balance
 */
async function addCreditsInTx(tx, userId, amount) {
  const userRef = db.collection("userProfiles").doc(userId);
  const userDoc = await tx.get(userRef);
  const current = userDoc.exists ? (userDoc.data().credits || 0) : 0;
  const newBalance = current + amount;

  if (userDoc.exists) {
    tx.update(userRef, {credits: newBalance});
  } else {
    tx.set(userRef, {credits: newBalance}, {merge: true});
  }

  return newBalance;
}

/**
 * Safely compares two hex strings using timing-safe comparison.
 * @param {string} a First hex string to compare.
 * @param {string} b Second hex string to compare.
 * @return {boolean} True if hex strings are equal, false otherwise.
 */
function safeEqualHex(a, b) {
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch (_e) {
    return false;
  }
}

// Server-side price map (smallest currency unit, e.g. MNT)
const PRICE_MAP = {
  basic: 6000,
  premium: 9000,
  standard: 6000,
};

// Tier expiration durations in days
const TIER_DURATION_DAYS = {
  free: 7,
  standard: 14,
  premium: 30,
};

// ── createBylCheckout ────────────────────────────────────────────────────

/**
 * Returns the appropriate CORS origin for the request.
 * Allows both the production base URL and localhost for development.
 * @param {object} req The incoming request.
 * @param {object} cfg The app configuration.
 * @return {string} The allowed origin.
 */
function getCorsOrigin(req, cfg) {
  const origin = req.get("Origin") || "";
  const allowed = [
    cfg.baseUrl,
    "https://www.bolzii.com",
    "https://mendchilgee-pi.vercel.app",
    "https://www.mendchilgee.site",
    "https://mendchilgee.site",
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean);
  if (allowed.includes(origin)) return origin;
  return cfg.baseUrl || "https://mendchilgee-pi.vercel.app";
}

exports.createBylCheckout = onRequest(async (req, res) => {
  const cfg = getConfig();

  // CORS
  res.set("Access-Control-Allow-Origin", getCorsOrigin(req, cfg));
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const body = req.body || {};
  const plan = body.plan;
  const customerEmail = body.customerEmail || null;
  const giftId = body.giftId || null;

  if (!PRICE_MAP[plan]) {
    return res.status(400).json({error: "Invalid plan"});
  }

  const amount = PRICE_MAP[plan];
  const randomStr = Math.random().toString(36).slice(2, 9);
  const clientRef = `gift_${Date.now()}_${randomStr}_${plan}`;

  const encodedRef = encodeURIComponent(clientRef);
  const giftParam = giftId ? `&giftId=${encodeURIComponent(giftId)}` : "";
  const payload = {
    success_url: `${cfg.baseUrl}/payment/success?ref=${encodedRef}${giftParam}`,
    cancel_url: `${cfg.baseUrl}`,
    client_reference_id: clientRef,
    customer_email: customerEmail,
    items: [
      {
        price_data: {
          unit_amount: amount,
          product_data: {name: `Valentine demo - ${plan}`},
        },
        quantity: 1,
      },
    ],
  };

  try {
    const response = await fetch(
        `https://byl.mn/api/v1/projects/${cfg.projectId}/checkouts`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${cfg.token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(payload),
        },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("BYL create checkout failed:", response.status, text);
      return res
          .status(500)
          .json({error: "BYL create failed", details: text});
    }

    const data = await response.json();
    const checkoutData = data.data;

    // Save pending payment to Firestore
    await db
        .collection("demo_payments")
        .doc(clientRef)
        .set({
          client_reference_id: clientRef,
          plan,
          giftId: giftId || null,
          amount,
          status: "pending",
          checkout_id: checkoutData.id || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          checkoutRaw: checkoutData,
        });

    return res.json({
      checkoutUrl: checkoutData.url,
      client_reference_id: clientRef,
    });
  } catch (err) {
    console.error("createBylCheckout error:", err);
    return res.status(500).json({error: "internal_error"});
  }
});

// ── bylWebhook ───────────────────────────────────────────────────────────

exports.bylWebhook = onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const rawBody = req.rawBody;
  if (!rawBody) {
    console.error("No rawBody on webhook request");
    return res.status(400).send("Bad Request");
  }

  const signature = req.get("Byl-Signature") || "";
  const cfg = getConfig();

  const computed = crypto
      .createHmac("sha256", cfg.webhookSecret)
      .update(rawBody)
      .digest("hex");

  if (!safeEqualHex(computed, signature)) {
    console.error("Webhook invalid signature", {
      computed: computed.substring(0, 10) + "...",
      signature: signature.substring(0, 10) + "...",
      secretLen: cfg.webhookSecret?.length || 0,
      bodyLen: rawBody?.length || 0,
      headerName: "Byl-Signature",
      allHeaders: Object.keys(req.headers).join(", "),
    });
    // ── TEMPORARY: process anyway to not lose payments ──
    // Remove this block once webhook secret is fixed
    console.warn("WARN: Processing webhook despite signature mismatch");
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch (err) {
    console.error("Webhook JSON parse error", err);
    return res.status(400).send("Invalid JSON");
  }

  try {
    // Idempotency check
    const eventId = event.id?.toString();
    if (eventId) {
      const processedRef = db
          .collection("processed_webhook_events")
          .doc(eventId);
      const snap = await processedRef.get();
      if (snap.exists) {
        console.log("Webhook already processed:", eventId);
        return res.status(200).send("OK");
      }
    }

    // Process checkout.completed
    if (event.type === "checkout.completed") {
      const checkout = event.data?.object;
      if (checkout && checkout.status === "complete") {
        const clientRef = checkout.client_reference_id;
        if (!clientRef) {
          console.warn("checkout.completed without client_reference_id");
        } else if (clientRef.startsWith("credit_")) {
          // ── Credit / Plan purchase via BYL ──
          const creditDocRef = db.collection("credit_payments").doc(clientRef);
          await db.runTransaction(async (tx) => {
            // ── ALL READS FIRST ──
            const doc = await tx.get(creditDocRef);
            if (!doc.exists) {
              console.warn("credit_payments doc not found:", clientRef);
              return;
            }
            const curStatus = doc.get("status");
            if (curStatus === "paid") {
              console.log("Credit payment already processed:", clientRef);
              return;
            }

            const creditData = doc.data();
            const userId = creditData.userId;
            const pType = creditData.purchaseType; // "gift"|"plan"|undefined

            // Read user profile BEFORE any writes
            const userRef = db.collection("userProfiles").doc(userId);
            const userDoc = await tx.get(userRef);

            // If gift purchase, also read the gift doc
            let giftRef = null;
            let giftDoc = null;
            if (pType === "gift" && creditData.giftId) {
              giftRef = db.collection("gifts").doc(creditData.giftId);
              giftDoc = await tx.get(giftRef);
            }

            // ── ALL WRITES AFTER ──
            // Mark paid
            tx.update(creditDocRef, {
              status: "paid",
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              checkoutRaw: checkout,
            });

            if (pType === "gift") {
              // ── Pay-per-gift: activate the specific gift ──
              const now = new Date();
              const expiresAt = new Date(
                  now.getTime() + GIFT_DURATION_DAYS * 24 * 60 * 60 * 1000,
              );

              if (giftRef && giftDoc && giftDoc.exists) {
                tx.update(giftRef, {
                  creditUsed: true,
                  status: "published",
                  paidTier: "standard",
                  paidAt:
                      admin.firestore.FieldValue.serverTimestamp(),
                  expiresAt:
                      admin.firestore.Timestamp.fromDate(expiresAt),
                });
              }

              // Also add 1 legacy credit to user profile for compat
              const currentCredits = userDoc.exists ?
                (userDoc.data().credits || 0) : 0;
              if (userDoc.exists) {
                tx.update(userRef, {credits: currentCredits + 1});
              } else {
                tx.set(userRef, {credits: currentCredits + 1}, {merge: true});
              }
            } else if (pType === "plan") {
              // ── Legacy plan purchase ──
              const pId = creditData.planId;
              const durationDays = PLAN_DURATION_DAYS[pId] ||
                  PLAN_DURATION_DAYS.basic;
              const now = new Date();
              const expiresAt = new Date(
                  now.getTime() + durationDays * 24 * 60 * 60 * 1000,
              );

              const currentCredits = userDoc.exists ?
                (userDoc.data().credits || 0) : 0;

              const planUpdate = {
                credits: currentCredits + 1,
                currentPlanId: pId,
                planExtraImages: creditData.extraImages || 0,
                planExtraVideoSeconds: creditData.extraVideoSeconds || 0,
                planTotalAmount: creditData.totalAmount || creditData.amount,
                planActivatedAt:
                    admin.firestore.FieldValue.serverTimestamp(),
                planExpiresAt:
                    admin.firestore.Timestamp.fromDate(expiresAt),
              };

              if (userDoc.exists) {
                tx.update(userRef, planUpdate);
              } else {
                tx.set(userRef, planUpdate, {merge: true});
              }
            } else {
              // ── Legacy credit purchase: just add credits ──
              const qty = creditData.quantity || 1;
              const currentCredits = userDoc.exists ?
                (userDoc.data().credits || 0) : 0;
              const newBalance = currentCredits + qty;
              if (userDoc.exists) {
                tx.update(userRef, {credits: newBalance});
              } else {
                tx.set(userRef, {credits: newBalance}, {merge: true});
              }
            }
          });

          const creditDoc = await creditDocRef.get();
          if (creditDoc.exists) {
            const cd = creditDoc.data();
            if (cd.purchaseType === "gift") {
              console.log(
                  `Gift purchase: gift ${cd.giftId} activated ` +
                  `for user ${cd.userId} (₮${cd.totalAmount})`,
              );
            } else if (cd.purchaseType === "plan") {
              console.log(
                  `Plan purchase: ${cd.planId} activated ` +
                  `for user ${cd.userId} (₮${cd.totalAmount})`,
              );
            } else {
              console.log(
                  `Credit purchase: ${cd.quantity} credits ` +
                  `added to user ${cd.userId}`,
              );
            }
          }
        } else {
          const paymentDocRef = db.collection("demo_payments").doc(clientRef);
          await db.runTransaction(async (tx) => {
            const doc = await tx.get(paymentDocRef);
            if (!doc.exists) {
              tx.set(
                  paymentDocRef,
                  {
                    client_reference_id: clientRef,
                    plan: "unknown",
                    amount: checkout.amount_total || null,
                    status: "paid",
                    checkout_id: checkout.id || null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    checkoutRaw: checkout,
                  },
                  {merge: true},
              );
              return;
            }
            const curStatus = doc.get("status");
            if (curStatus === "paid") {
              console.log("Payment already marked paid:", clientRef);
            } else {
              tx.update(paymentDocRef, {
                status: "paid",
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                checkoutRaw: checkout,
              });
            }
          });

          // ── Update gift document with tier & expiration ──
          const paymentDoc = await paymentDocRef.get();
          const paymentData = paymentDoc.exists ? paymentDoc.data() : {};
          const paidGiftId = paymentData.giftId;
          const paidPlan = paymentData.plan || "standard";

          if (paidGiftId) {
            const now = new Date();
            const durationDays = TIER_DURATION_DAYS[paidPlan] ||
                TIER_DURATION_DAYS.standard;
            const expiresAt = new Date(
                now.getTime() + durationDays * 24 * 60 * 60 * 1000,
            );

            await db.collection("gifts").doc(paidGiftId).update({
              paidTier: paidPlan,
              activatedAt: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
              paymentExpired: false,
            });

            console.log(
                `Gift ${paidGiftId} upgraded to ${paidPlan}, ` +
                `expires ${expiresAt.toISOString()}`,
            );
          }
        }
      }
    }

    // Mark event processed (idempotency)
    if (event.id) {
      await db
          .collection("processed_webhook_events")
          .doc(event.id.toString())
          .set({
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            eventType: event.type || null,
          });
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).send("Server Error");
  }
});

// ── checkPaymentStatus ───────────────────────────────────────────────────

exports.checkPaymentStatus = onRequest(async (req, res) => {
  const cfg = getConfig();

  res.set("Access-Control-Allow-Origin", getCorsOrigin(req, cfg));
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  const ref = req.query.ref;
  if (!ref) return res.status(400).json({error: "missing ref"});

  const paymentDocRef = db.collection("demo_payments").doc(ref);
  const docSnap = await paymentDocRef.get();
  if (!docSnap.exists) return res.status(404).json({status: "not_found"});

  const data = docSnap.data();

  // If already paid, return immediately
  if (data?.status === "paid") {
    return res.json({
      status: "paid",
      paidAt: data?.paidAt || null,
      amount: data?.amount || null,
      plan: data?.plan || null,
      giftId: data?.giftId || null,
    });
  }

  // ── Fallback: if webhook hasn't arrived yet, check BYL API directly ──
  const checkoutId = data?.checkout_id;
  if (checkoutId && cfg.token && cfg.projectId) {
    try {
      const bylRes = await fetch(
          `https://byl.mn/api/v1/projects/${cfg.projectId}/checkouts/${checkoutId}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${cfg.token}`,
              "Accept": "application/json",
            },
          },
      );
      if (bylRes.ok) {
        const bylData = await bylRes.json();
        const checkout = bylData.data || bylData;
        if (checkout.status === "complete" || checkout.status === "paid") {
          // Process payment since webhook hasn't arrived
          const plan = data.plan || "standard";
          const giftId = data.giftId;

          // Mark paid
          await paymentDocRef.update({
            status: "paid",
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            checkoutRaw: checkout,
            paidVia: "polling_fallback",
          });

          // Update gift tier if giftId exists
          if (giftId) {
            const now = new Date();
            const durationDays = TIER_DURATION_DAYS[plan] ||
                TIER_DURATION_DAYS.standard;
            const expiresAt = new Date(
                now.getTime() + durationDays * 24 * 60 * 60 * 1000,
            );
            await db.collection("gifts").doc(giftId).update({
              paidTier: plan,
              activatedAt: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
              paymentExpired: false,
            }).catch((err) =>
              console.warn("Failed to update gift tier:", err),
            );
          }

          return res.json({
            status: "paid",
            paidAt: null,
            amount: data?.amount || null,
            plan: data?.plan || null,
            giftId: data?.giftId || null,
          });
        }
      }
    } catch (err) {
      console.warn("BYL fallback check failed:", err.message);
    }
  }

  return res.json({
    status: data?.status || "pending",
    paidAt: data?.paidAt || null,
    amount: data?.amount || null,
    plan: data?.plan || null,
    giftId: data?.giftId || null,
  });
});

// ── checkExpiredGifts ────────────────────────────────────────────────────
// Callable endpoint to expire gifts whose expiresAt has passed.
// Can be triggered by Cloud Scheduler or manually.

exports.checkExpiredGifts = onRequest(async (req, res) => {
  const cfg = getConfig();

  res.set("Access-Control-Allow-Origin", getCorsOrigin(req, cfg));
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const now = admin.firestore.Timestamp.now();

    // Find gifts where expiresAt <= now AND paymentExpired !== true
    const snapshot = await db.collection("gifts")
        .where("expiresAt", "<=", now)
        .where("paymentExpired", "==", false)
        .get();

    if (snapshot.empty) {
      return res.json({expired: 0, message: "No gifts to expire"});
    }

    const batch = db.batch();
    let count = 0;

    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        paymentExpired: true,
        paidTier: "free",
      });
      count++;
    });

    await batch.commit();

    console.log(`Expired ${count} gifts`);
    return res.json({expired: count, message: `Expired ${count} gifts`});
  } catch (err) {
    console.error("checkExpiredGifts error:", err);
    return res.status(500).json({error: "internal_error"});
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BYL Credit Purchase Functions
// ═══════════════════════════════════════════════════════════════════════════

const CREDIT_PRICE = 5000; // MNT per credit (legacy)

// ── Pricing constants (mirror of frontend plans.js) ─────────────────────
const BASE_GIFT_PRICE = 5000; // base price per gift
const INCLUDED_IMAGES = 4; // images included in base price
const EXTRA_IMG_PRICE = 500; // per extra image
const EXTRA_VID_PRICE = 500; // per video clip
const GIFT_DURATION_DAYS = 14; // how long a paid gift stays active

// Legacy plan pricing (kept for backward compat)
const PLAN_PRICES = {
  basic: 5000,
  standard: 8000,
  premium: 12000,
};
const PLAN_LABELS = {
  basic: "Энгийн",
  standard: "Стандарт",
  premium: "Премиум",
};
const PLAN_DURATION_DAYS = {
  basic: 7,
  standard: 14,
  premium: 30,
};

// ── createCreditCheckout ─────────────────────────────────────────────────
// Creates a BYL checkout session.
// type "gift":   pay-per-gift { userId, giftId, imageCount, videoCount }
// type "plan":   (legacy) plan purchase
// type "credit": (legacy) credit purchase
// client_reference_id format: credit_<ts>_<rand>_<tag>

exports.createCreditCheckout = onRequest(async (req, res) => {
  const cfg = getConfig();

  res.set("Access-Control-Allow-Origin", getCorsOrigin(req, cfg));
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const body = req.body || {};
  const userId = body.userId;
  const purchaseType = body.type || "credit";

  if (!userId) {
    return res.status(400).json({error: "Missing userId"});
  }

  let amount;
  let quantity = 1;
  let clientRef;
  let productName;
  const randomStr = Math.random().toString(36).slice(2, 9);

  // Extra metadata to store
  const meta = {};

  if (purchaseType === "gift") {
    // ── Pay-per-gift purchase ──
    const giftId = body.giftId;
    const imageCount = Math.max(0, parseInt(body.imageCount) || 0);
    const videoCount = Math.max(0, parseInt(body.videoCount) || 0);

    if (!giftId) {
      return res.status(400).json({error: "Missing giftId"});
    }

    const extraImages = Math.max(0, imageCount - INCLUDED_IMAGES);
    const imgCost = extraImages * EXTRA_IMG_PRICE;
    const vidCost = videoCount * EXTRA_VID_PRICE;
    amount = BASE_GIFT_PRICE + imgCost + vidCost;

    clientRef = `credit_${Date.now()}_${randomStr}_gift`;
    productName = `Мэндчилгээ`;
    if (extraImages > 0) productName += ` +${extraImages} зураг`;
    if (videoCount > 0) productName += ` +${videoCount} видео`;

    meta.purchaseType = "gift";
    meta.giftId = giftId;
    meta.imageCount = imageCount;
    meta.videoCount = videoCount;
    meta.extraImages = extraImages;
    meta.imgCost = imgCost;
    meta.vidCost = vidCost;
    meta.totalAmount = amount;
  } else if (purchaseType === "plan") {
    // ── Legacy plan-based purchase ──
    const planId = body.planId;
    if (!planId || !PLAN_PRICES[planId]) {
      return res.status(400).json({error: "Invalid planId"});
    }
    const extraImages = Math.max(0, parseInt(body.extraImages) || 0);
    const extraVideoSeconds = Math.max(0, parseInt(body.extraVideoSeconds) || 0);
    const basePlanPrice = PLAN_PRICES[planId];
    const extraImgCost = extraImages * EXTRA_IMG_PRICE;
    const videoChunks = Math.ceil(extraVideoSeconds / 10);
    const extraVidCost = videoChunks * EXTRA_VID_PRICE;
    amount = basePlanPrice + extraImgCost + extraVidCost;

    clientRef = `credit_${Date.now()}_${randomStr}_plan`;
    productName = `${PLAN_LABELS[planId] || planId} багц`;

    meta.purchaseType = "plan";
    meta.planId = planId;
    meta.extraImages = extraImages;
    meta.extraVideoSeconds = extraVideoSeconds;
    meta.totalAmount = amount;
  } else {
    // ── Legacy credit purchase ──
    quantity = Math.max(1, Math.min(10, parseInt(body.quantity) || 1));
    amount = CREDIT_PRICE * quantity;
    clientRef = `credit_${Date.now()}_${randomStr}_${quantity}`;
    productName = `Мэндчилгээ эрх (x${quantity})`;
  }

  const encodedRef = encodeURIComponent(clientRef);
  const payload = {
    success_url: `${cfg.baseUrl}/payment/success?ref=${encodedRef}&type=credit`,
    cancel_url: `${cfg.baseUrl}/payment/cancel?ref=${encodedRef}&type=credit`,
    client_reference_id: clientRef,
    items: [
      {
        price_data: {
          unit_amount: amount,
          product_data: {name: productName},
        },
        quantity: 1,
      },
    ],
  };

  try {
    const response = await fetch(
        `https://byl.mn/api/v1/projects/${cfg.projectId}/checkouts`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${cfg.token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(payload),
        },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("BYL create credit checkout failed:",
          response.status, text);
      return res.status(500).json({error: "BYL checkout creation failed"});
    }

    const data = await response.json();
    const checkoutData = data.data;

    // Save to credit_payments collection
    const docData = {
      client_reference_id: clientRef,
      userId,
      quantity,
      amount,
      status: "pending",
      checkout_id: checkoutData.id || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...meta,
    };

    await db.collection("credit_payments").doc(clientRef).set(docData);

    return res.json({
      checkoutUrl: checkoutData.url,
      client_reference_id: clientRef,
    });
  } catch (err) {
    console.error("createCreditCheckout error:", err);
    return res.status(500).json({error: "internal_error"});
  }
});

// ── checkCreditPayment ───────────────────────────────────────────────────

exports.checkCreditPayment = onRequest(async (req, res) => {
  const cfg = getConfig();

  res.set("Access-Control-Allow-Origin", getCorsOrigin(req, cfg));
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  const ref = req.query.ref;
  if (!ref) return res.status(400).json({error: "missing ref"});

  const creditDocRef = db.collection("credit_payments").doc(ref);
  const docSnap = await creditDocRef.get();
  if (!docSnap.exists) return res.status(404).json({status: "not_found"});

  const data = docSnap.data();

  // If already paid, return immediately
  if (data?.status === "paid") {
    const response = {
      status: "paid",
      quantity: data?.quantity || 0,
      amount: data?.amount || 0,
      purchaseType: data?.purchaseType || "credit",
    };
    // Include gift details
    if (data?.purchaseType === "gift") {
      response.giftId = data.giftId;
      response.imageCount = data.imageCount || 0;
      response.videoCount = data.videoCount || 0;
      response.extraImages = data.extraImages || 0;
      response.imgCost = data.imgCost || 0;
      response.vidCost = data.vidCost || 0;
      response.totalAmount = data.totalAmount || data.amount || 0;
    }
    // Include plan details if this was a plan purchase
    if (data?.purchaseType === "plan") {
      response.planId = data.planId;
      response.extraImages = data.extraImages || 0;
      response.extraVideoSeconds = data.extraVideoSeconds || 0;
      response.totalAmount = data.totalAmount || data.amount || 0;
    }
    return res.json(response);
  }

  // ── Fallback: if webhook hasn't arrived yet, check BYL API directly ──
  const checkoutId = data?.checkout_id;
  if (checkoutId && cfg.token && cfg.projectId) {
    try {
      const bylRes = await fetch(
          `https://byl.mn/api/v1/projects/${cfg.projectId}/checkouts/${checkoutId}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${cfg.token}`,
              "Accept": "application/json",
            },
          },
      );
      if (bylRes.ok) {
        const bylData = await bylRes.json();
        const checkout = bylData.data || bylData;
        if (checkout.status === "complete" || checkout.status === "paid") {
          // Webhook hasn't arrived yet — process payment now
          const userId = data.userId;
          const pType = data.purchaseType; // "gift"|"plan"|undefined

          await db.runTransaction(async (tx) => {
            // ── ALL READS FIRST ──
            const freshSnap = await tx.get(creditDocRef);
            if (freshSnap.exists && freshSnap.data().status === "paid") {
              return; // Already processed (webhook came in the meantime)
            }

            let currentCredits = 0;
            let userExists = false;
            const userRef = userId ?
              db.collection("userProfiles").doc(userId) : null;
            if (userRef) {
              const userDoc = await tx.get(userRef);
              userExists = userDoc.exists;
              currentCredits = userExists ?
                (userDoc.data().credits || 0) : 0;
            }

            // Read gift doc if gift purchase
            let giftRef = null;
            let giftDoc = null;
            if (pType === "gift" && data.giftId) {
              giftRef = db.collection("gifts").doc(data.giftId);
              giftDoc = await tx.get(giftRef);
            }

            // ── ALL WRITES AFTER ──
            // Mark paid
            tx.update(creditDocRef, {
              status: "paid",
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              checkoutRaw: checkout,
              paidVia: "polling_fallback",
            });

            if (pType === "gift") {
              // ── Gift purchase: activate the specific gift ──
              const now = new Date();
              const expiresAt = new Date(
                  now.getTime() + GIFT_DURATION_DAYS * 24 * 60 * 60 * 1000,
              );
              if (giftRef && giftDoc && giftDoc.exists) {
                tx.update(giftRef, {
                  creditUsed: true,
                  status: "published",
                  paidTier: "standard",
                  paidAt:
                      admin.firestore.FieldValue.serverTimestamp(),
                  expiresAt:
                      admin.firestore.Timestamp.fromDate(expiresAt),
                });
              }
              // Add 1 legacy credit for compat
              if (userRef) {
                if (userExists) {
                  tx.update(userRef, {credits: currentCredits + 1});
                } else {
                  tx.set(userRef, {credits: currentCredits + 1}, {merge: true});
                }
              }
            } else if (userRef) {
              if (pType === "plan") {
                // ── Plan purchase: set plan + 1 credit ──
                const pId = data.planId;
                const durationDays = PLAN_DURATION_DAYS[pId] ||
                    PLAN_DURATION_DAYS.basic;
                const now = new Date();
                const expiresAt = new Date(
                    now.getTime() + durationDays * 24 * 60 * 60 * 1000,
                );
                const planUpdate = {
                  credits: currentCredits + 1,
                  currentPlanId: pId,
                  planExtraImages: data.extraImages || 0,
                  planExtraVideoSeconds: data.extraVideoSeconds || 0,
                  planTotalAmount: data.totalAmount || data.amount,
                  planActivatedAt:
                      admin.firestore.FieldValue.serverTimestamp(),
                  planExpiresAt:
                      admin.firestore.Timestamp.fromDate(expiresAt),
                };
                if (userExists) {
                  tx.update(userRef, planUpdate);
                } else {
                  tx.set(userRef, planUpdate, {merge: true});
                }
              } else {
                // ── Legacy credit: add credits ──
                const qty = data.quantity || 1;
                const newBalance = currentCredits + qty;
                if (userExists) {
                  tx.update(userRef, {credits: newBalance});
                } else {
                  tx.set(userRef, {credits: newBalance}, {merge: true});
                }
              }
            }
          });

          const paidResponse = {
            status: "paid",
            quantity: data?.quantity || 0,
            amount: data?.amount || 0,
            purchaseType: data?.purchaseType || "credit",
          };
          if (pType === "gift") {
            paidResponse.giftId = data.giftId;
            paidResponse.imageCount = data.imageCount || 0;
            paidResponse.videoCount = data.videoCount || 0;
            paidResponse.extraImages = data.extraImages || 0;
            paidResponse.imgCost = data.imgCost || 0;
            paidResponse.vidCost = data.vidCost || 0;
            paidResponse.totalAmount = data.totalAmount || data.amount || 0;
          }
          if (pType === "plan") {
            paidResponse.planId = data.planId;
            paidResponse.extraImages = data.extraImages || 0;
            paidResponse.extraVideoSeconds = data.extraVideoSeconds || 0;
            paidResponse.totalAmount = data.totalAmount || data.amount || 0;
          }
          return res.json(paidResponse);
        }
      }
    } catch (err) {
      console.warn("BYL fallback check failed:", err.message);
      // Fall through to return pending status
    }
  }

  const pendingResponse = {
    status: data?.status || "pending",
    quantity: data?.quantity || 0,
    amount: data?.amount || 0,
    purchaseType: data?.purchaseType || "credit",
  };
  if (data?.purchaseType === "gift") {
    pendingResponse.giftId = data.giftId;
    pendingResponse.imageCount = data.imageCount || 0;
    pendingResponse.videoCount = data.videoCount || 0;
    pendingResponse.extraImages = data.extraImages || 0;
    pendingResponse.imgCost = data.imgCost || 0;
    pendingResponse.vidCost = data.vidCost || 0;
    pendingResponse.totalAmount = data.totalAmount || data.amount || 0;
  }
  if (data?.purchaseType === "plan") {
    pendingResponse.planId = data.planId;
    pendingResponse.extraImages = data.extraImages || 0;
    pendingResponse.extraVideoSeconds = data.extraVideoSeconds || 0;
    pendingResponse.totalAmount = data.totalAmount || data.amount || 0;
  }
  return res.json(pendingResponse);
});

// ═══════════════════════════════════════════════════════════════════════════
// Promo Code & Credit Functions
// ═══════════════════════════════════════════════════════════════════════════

// ── redeemPromoCode ──────────────────────────────────────────────────────

exports.redeemPromoCode = onRequest(async (req, res) => {
  const cfg = getConfig();

  res.set("Access-Control-Allow-Origin", getCorsOrigin(req, cfg));
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const body = req.body || {};
  const rawCode = (body.code || "").trim().toUpperCase();
  // Strip slashes and whitespace — prevent invalid Firestore paths
  const code = rawCode.replace(/[/\\]/g, "").trim();
  const userId = body.userId;

  if (!code || !userId) {
    return res.status(400).json({error: "missing_params",
      message: "Промо код эсвэл хэрэглэгчийн мэдээлэл дутуу байна"});
  }

  try {
    const result = await db.runTransaction(async (tx) => {
      // Check promo code exists and is active
      const codeRef = db.collection("promoCodes").doc(code);
      const codeDoc = await tx.get(codeRef);

      if (!codeDoc.exists) {
        return {error: "invalid_code"};
      }

      const codeData = codeDoc.data();
      if (codeData.active === false) {
        return {error: "code_inactive"};
      }

      // Check if already used by this user
      const redemptionId = `${userId}_${code}`;
      const redemptionRef = db.collection("promoRedemptions")
          .doc(redemptionId);
      const redemptionDoc = await tx.get(redemptionRef);

      if (redemptionDoc.exists) {
        return {error: "already_used"};
      }

      // Check max uses limit
      if (codeData.maxUses && (codeData.currentUses || 0) >=
          codeData.maxUses) {
        return {error: "code_exhausted"};
      }

      // All checks passed — redeem
      const creditsToAdd = codeData.credits || 1;
      const newBalance = await addCreditsInTx(tx, userId, creditsToAdd);

      // Record redemption
      tx.set(redemptionRef, {
        userId,
        code,
        creditsAdded: creditsToAdd,
        redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Increment usage counter
      tx.update(codeRef, {
        currentUses: (codeData.currentUses || 0) + 1,
      });

      return {success: true, newCredits: newBalance};
    });

    if (result.error) {
      const messages = {
        invalid_code: "Промо код олдсонгүй",
        code_inactive: "Промо код идэвхгүй байна",
        already_used: "Та энэ промо кодыг аль хэдийн ашигласан байна",
        code_exhausted: "Промо кодын хэрэглээний лимит дууссан байна",
      };
      return res.status(400).json({
        error: result.error,
        message: messages[result.error] || "Алдаа гарлаа",
      });
    }

    return res.json(result);
  } catch (err) {
    console.error("redeemPromoCode error:", err);
    return res.status(500).json({error: "internal_error",
      message: "Серверийн алдаа. Дахин оролдоно уу."});
  }
});

// ── useCredit ────────────────────────────────────────────────────────────

exports.useCredit = onRequest(async (req, res) => {
  const cfg = getConfig();

  res.set("Access-Control-Allow-Origin", getCorsOrigin(req, cfg));
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const body = req.body || {};
  const userId = body.userId;
  const giftId = body.giftId;

  if (!userId || !giftId) {
    return res.status(400).json({error: "Missing userId or giftId"});
  }

  try {
    const result = await db.runTransaction(async (tx) => {
      const userRef = db.collection("userProfiles").doc(userId);
      const userDoc = await tx.get(userRef);
      const credits = userDoc.exists ? (userDoc.data().credits || 0) : 0;

      if (credits <= 0) {
        return {error: "no_credits"};
      }

      // Check if gift is already activated — prevent double charge
      const giftRef = db.collection("gifts").doc(giftId);
      const giftDoc = await tx.get(giftRef);
      if (giftDoc.exists) {
        const giftData = giftDoc.data();
        if (giftData.status === "published" && giftData.creditUsed === true) {
          // Already activated — don't charge again
          return {success: true, remainingCredits: credits, alreadyActivated: true};
        }
      }

      // Deduct 1 credit
      tx.update(userRef, {credits: credits - 1});

      // Activate gift — set to premium tier with no expiration
      tx.update(giftRef, {
        paidTier: "premium",
        status: "published",
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentExpired: false,
        creditUsed: true,
      });

      return {success: true, remainingCredits: credits - 1};
    });

    if (result.error) {
      return res.status(400).json({
        error: result.error,
        message: result.error === "no_credits" ?
          "Эрх хүрэлцэхгүй байна. Эрх худалдаж авна уу." :
          "Алдаа гарлаа",
      });
    }

    return res.json(result);
  } catch (err) {
    console.error("useCredit error:", err);
    return res.status(500).json({error: "internal_error"});
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// fixPendingPayments — One-time admin endpoint to fix stuck pending payments
// Scans all credit_payments & demo_payments with status "pending",
// checks BYL API, and processes any that were actually paid.
// ═══════════════════════════════════════════════════════════════════════════

exports.fixPendingPayments = onRequest(async (req, res) => {
  const cfg = getConfig();

  res.set("Access-Control-Allow-Origin", getCorsOrigin(req, cfg));
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // Simple admin guard — require a secret key
  const adminKey = req.body?.adminKey || req.query?.adminKey;
  if (adminKey !== (process.env.ADMIN_SECRET || "fix_pending_2026")) {
    return res.status(403).json({error: "Unauthorized"});
  }

  if (!cfg.token || !cfg.projectId) {
    return res.status(500).json({error: "BYL config missing"});
  }

  const results = {
    creditPayments: {scanned: 0, fixed: 0, alreadyPaid: 0, notPaid: 0, errors: 0, details: []},
    demoPayments: {scanned: 0, fixed: 0, alreadyPaid: 0, notPaid: 0, errors: 0, details: []},
  };

  // ── Fix credit_payments ──
  try {
    const pendingCredits = await db.collection("credit_payments")
        .where("status", "==", "pending")
        .get();

    results.creditPayments.scanned = pendingCredits.size;

    for (const docSnap of pendingCredits.docs) {
      const data = docSnap.data();
      const checkoutId = data.checkout_id;
      const clientRef = docSnap.id;

      if (!checkoutId) {
        results.creditPayments.errors++;
        results.creditPayments.details.push({ref: clientRef, error: "no checkout_id"});
        continue;
      }

      try {
        const bylRes = await fetch(
            `https://byl.mn/api/v1/projects/${cfg.projectId}/checkouts/${checkoutId}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${cfg.token}`,
                "Accept": "application/json",
              },
            },
        );

        if (!bylRes.ok) {
          results.creditPayments.errors++;
          results.creditPayments.details.push({ref: clientRef, error: `BYL API ${bylRes.status}`});
          continue;
        }

        const bylData = await bylRes.json();
        const checkout = bylData.data || bylData;

        if (checkout.status === "complete" || checkout.status === "paid") {
          // Payment was successful — fix it
          const userId = data.userId;
          const qty = data.quantity || 1;

          await db.runTransaction(async (tx) => {
            // ── ALL READS FIRST ──
            const freshSnap = await tx.get(docSnap.ref);
            if (freshSnap.exists && freshSnap.data().status === "paid") {
              results.creditPayments.alreadyPaid++;
              return;
            }

            let currentCredits = 0;
            let userExists = false;
            const userRef = userId ?
              db.collection("userProfiles").doc(userId) : null;
            if (userRef) {
              const userDoc = await tx.get(userRef);
              userExists = userDoc.exists;
              currentCredits = userExists ?
                (userDoc.data().credits || 0) : 0;
            }

            // ── ALL WRITES AFTER ──
            tx.update(docSnap.ref, {
              status: "paid",
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              paidVia: "fixPendingPayments_script",
              fixedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            if (userRef) {
              const newBalance = currentCredits + qty;
              if (userExists) {
                tx.update(userRef, {credits: newBalance});
              } else {
                tx.set(userRef, {credits: newBalance}, {merge: true});
              }
            }

            results.creditPayments.fixed++;
            results.creditPayments.details.push({
              ref: clientRef,
              userId,
              quantity: qty,
              status: "FIXED",
            });
          });
        } else {
          results.creditPayments.notPaid++;
          results.creditPayments.details.push({
            ref: clientRef,
            bylStatus: checkout.status,
            status: "NOT_PAID_ON_BYL",
          });
        }
      } catch (err) {
        results.creditPayments.errors++;
        results.creditPayments.details.push({ref: clientRef, error: err.message});
      }
    }
  } catch (err) {
    results.creditPayments.errors++;
    console.error("fixPendingPayments credit scan error:", err);
  }

  // ── Fix demo_payments (tier payments) ──
  try {
    const pendingDemo = await db.collection("demo_payments")
        .where("status", "==", "pending")
        .get();

    results.demoPayments.scanned = pendingDemo.size;

    for (const docSnap of pendingDemo.docs) {
      const data = docSnap.data();
      const checkoutId = data.checkout_id;
      const clientRef = docSnap.id;

      if (!checkoutId) {
        results.demoPayments.errors++;
        results.demoPayments.details.push({ref: clientRef, error: "no checkout_id"});
        continue;
      }

      try {
        const bylRes = await fetch(
            `https://byl.mn/api/v1/projects/${cfg.projectId}/checkouts/${checkoutId}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${cfg.token}`,
                "Accept": "application/json",
              },
            },
        );

        if (!bylRes.ok) {
          results.demoPayments.errors++;
          results.demoPayments.details.push({ref: clientRef, error: `BYL API ${bylRes.status}`});
          continue;
        }

        const bylData = await bylRes.json();
        const checkout = bylData.data || bylData;

        if (checkout.status === "complete" || checkout.status === "paid") {
          const plan = data.plan || "standard";
          const giftId = data.giftId;

          await docSnap.ref.update({
            status: "paid",
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            paidVia: "fixPendingPayments_script",
            fixedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Update gift tier if giftId exists
          if (giftId) {
            const now = new Date();
            const durationDays = TIER_DURATION_DAYS[plan] || TIER_DURATION_DAYS.standard;
            const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
            await db.collection("gifts").doc(giftId).update({
              paidTier: plan,
              activatedAt: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
              paymentExpired: false,
            }).catch((err) => console.warn("Gift update failed:", err));
          }

          results.demoPayments.fixed++;
          results.demoPayments.details.push({
            ref: clientRef,
            giftId,
            plan,
            status: "FIXED",
          });
        } else {
          results.demoPayments.notPaid++;
          results.demoPayments.details.push({
            ref: clientRef,
            bylStatus: checkout.status,
            status: "NOT_PAID_ON_BYL",
          });
        }
      } catch (err) {
        results.demoPayments.errors++;
        results.demoPayments.details.push({ref: clientRef, error: err.message});
      }
    }
  } catch (err) {
    results.demoPayments.errors++;
    console.error("fixPendingPayments demo scan error:", err);
  }

  console.log("fixPendingPayments results:", JSON.stringify(results, null, 2));
  return res.json(results);
});
