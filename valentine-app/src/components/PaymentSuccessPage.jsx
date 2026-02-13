import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { TIER_META, TIER_DURATION_DAYS } from "../config/tiers";
import "./DemoPaymentPage.css";

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  const giftId = searchParams.get("giftId");
  const [status, setStatus] = useState(() => (ref ? "checking" : "no_ref"));
  const [attempts, setAttempts] = useState(0);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (!ref) return;

    let cancelled = false;
    const maxTries = 40;

    async function poll() {
      let tries = 0;
      while (tries < maxTries && !cancelled) {
        tries++;
        setAttempts(tries);
        try {
          const r = await fetch(
            `${FUNCTIONS_BASE}/checkPaymentStatus?ref=${encodeURIComponent(ref)}`,
          );
          if (!r.ok) break;
          const j = await r.json();
          if (j.status === "paid") {
            setStatus("paid");
            setPaymentData(j);
            return;
          } else if (j.status === "not_found") {
            setStatus("not_found");
            return;
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
        // Wait 2 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      if (!cancelled && status !== "paid") {
        setStatus("timeout");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "no_ref") {
    return (
      <div className="payment-status-page">
        <div className="status-icon">❓</div>
        <h1>No reference provided</h1>
        <Link to="/">← Нүүр хуудас руу буцах</Link>
      </div>
    );
  }

  if (status === "paid") {
    const tier = paymentData?.plan || "standard";
    const tierMeta = TIER_META[tier] || TIER_META.standard;
    const durationDays = TIER_DURATION_DAYS[tier] || 14;

    return (
      <div className="payment-status-page">
        <div className="status-icon">🎉</div>
        <h1>Төлбөр амжилттай!</h1>
        <p>
          Таны бэлэг{" "}
          <strong>
            {tierMeta.badge} {tierMeta.label}
          </strong>{" "}
          төлөвлөгөөнд шилжлээ.
        </p>
        <p>
          Идэвхтэй хугацаа: <strong>{durationDays} хоног</strong>
        </p>
        <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
          Watermark арилсан байна. Бэлгээ хуваалцаарай! 💕
        </p>
        {giftId ? (
          <Link to={`/${giftId}`}>← Бэлгээ харах</Link>
        ) : (
          <Link to="/">← Нүүр хуудас руу буцах</Link>
        )}
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="payment-status-page">
        <div className="status-icon">🔍</div>
        <h1>Төлбөр олдсонгүй</h1>
        <p>Энэ төлбөрийг олж чадсангүй. Тусламжтай холбогдоно уу.</p>
        <Link to="/">← Нүүр хуудас руу буцах</Link>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="payment-status-page">
        <div className="status-icon">⏳</div>
        <h1>Боловсруулж байна…</h1>
        <p>Таны төлбөр баталгаажиж байна. Түр хүлээнэ үү.</p>
        <Link to="/">← Нүүр хуудас руу буцах</Link>
      </div>
    );
  }

  return (
    <div className="payment-status-page">
      <div className="status-icon">💳</div>
      <h1>Төлбөр шалгаж байна…</h1>
      <div className="spinner" />
      <p>Оролдлого {attempts} — түр хүлээнэ үү</p>
    </div>
  );
}
