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
    console.error("Webhook invalid signature", {computed, signature});
    return res.status(401).send("Invalid signature");
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
          // ── Credit purchase via BYL ──
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
            const qty = creditData.quantity || 1;

            // Read user profile BEFORE any writes
            const userRef = db.collection("userProfiles").doc(userId);
            const userDoc = await tx.get(userRef);

            // ── ALL WRITES AFTER ──
            // Mark paid
            tx.update(creditDocRef, {
              status: "paid",
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              checkoutRaw: checkout,
            });

            // Add credits to user
            const currentCredits = userDoc.exists ?
              (userDoc.data().credits || 0) : 0;
            const newBalance = currentCredits + qty;
            if (userDoc.exists) {
              tx.update(userRef, {credits: newBalance});
            } else {
              tx.set(userRef, {credits: newBalance}, {merge: true});
            }
          });

          const creditDoc = await creditDocRef.get();
          if (creditDoc.exists) {
            console.log(
                `Credit purchase: ${creditDoc.data().quantity} credits ` +
                `added to user ${creditDoc.data().userId}`,
            );
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

  const doc = await db.collection("demo_payments").doc(ref).get();
  if (!doc.exists) return res.status(404).json({status: "not_found"});

  const data = doc.data();
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

const CREDIT_PRICE = 5000; // MNT per credit

// ── createCreditCheckout ─────────────────────────────────────────────────
// Creates a BYL checkout session specifically for purchasing credits.
// client_reference_id format: credit_<ts>_<rand>_<qty>
// userId is saved in credit_payments collection for webhook lookup.

exports.createCreditCheckout = onRequest(async (req, res) => {
  const cfg = getConfig();

  res.set("Access-Control-Allow-Origin", getCorsOrigin(req, cfg));
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const body = req.body || {};
  const userId = body.userId;
  const quantity = Math.max(1, Math.min(10, parseInt(body.quantity) || 1));

  if (!userId) {
    return res.status(400).json({error: "Missing userId"});
  }

  const amount = CREDIT_PRICE * quantity;
  const randomStr = Math.random().toString(36).slice(2, 9);
  const clientRef = `credit_${Date.now()}_${randomStr}_${quantity}`;

  const encodedRef = encodeURIComponent(clientRef);
  const payload = {
    success_url: `${cfg.baseUrl}/payment/success?ref=${encodedRef}&type=credit`,
    cancel_url: `${cfg.baseUrl}/payment/cancel?ref=${encodedRef}&type=credit`,
    client_reference_id: clientRef,
    items: [
      {
        price_data: {
          unit_amount: CREDIT_PRICE,
          product_data: {name: `Мэндчилгээ эрх (x${quantity})`},
        },
        quantity,
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
    await db.collection("credit_payments").doc(clientRef).set({
      client_reference_id: clientRef,
      userId,
      quantity,
      amount,
      status: "pending",
      checkout_id: checkoutData.id || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

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

  const docSnap = await db.collection("credit_payments").doc(ref).get();
  if (!docSnap.exists) return res.status(404).json({status: "not_found"});

  const data = docSnap.data();
  return res.json({
    status: data?.status || "pending",
    quantity: data?.quantity || 0,
    amount: data?.amount || 0,
  });
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
  const code = (body.code || "").trim().toUpperCase();
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

      // Deduct 1 credit
      tx.update(userRef, {credits: credits - 1});

      // Activate gift — set to premium tier with no expiration
      const giftRef = db.collection("gifts").doc(giftId);
      tx.update(giftRef, {
        paidTier: "premium",
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
