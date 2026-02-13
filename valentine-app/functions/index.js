/**
 * BYL Payment Cloud Functions
 *
 * Endpoints:
 *   POST /createBylCheckout — create BYL checkout & save pending payment
 *   POST /bylWebhook — receive BYL webhooks, verify signature, mark paid
 *   GET  /checkPaymentStatus?ref=<client_reference_id> — poll payment status
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
};

// ── createBylCheckout ────────────────────────────────────────────────────

exports.createBylCheckout = onRequest(async (req, res) => {
  const cfg = getConfig();

  // CORS
  res.set("Access-Control-Allow-Origin", cfg.baseUrl || "http://localhost:5173");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const body = req.body || {};
  const plan = body.plan;
  const customerEmail = body.customerEmail || null;

  if (!PRICE_MAP[plan]) {
    return res.status(400).json({error: "Invalid plan"});
  }

  const amount = PRICE_MAP[plan];
  const randomStr = Math.random().toString(36).slice(2, 9);
  const clientRef = `demo_${Date.now()}_${randomStr}_${plan}`;

  const encodedRef = encodeURIComponent(clientRef);
  const payload = {
    success_url: `${cfg.baseUrl}/demo-payments/success?ref=${encodedRef}`,
    cancel_url: `${cfg.baseUrl}/demo-payments/cancel`,
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

  res.set("Access-Control-Allow-Origin", cfg.baseUrl || "*");
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
  });
});
