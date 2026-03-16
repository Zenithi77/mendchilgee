import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { BASE_PRICE, INCLUDED_IMAGES, EXTRA_IMAGE_PRICE, EXTRA_VIDEO_PRICE } from "../config/plans";
import { MdHelp, MdCelebration, MdAutoAwesome, MdSearch, MdPayment, MdReceipt, MdPhotoCamera, MdVideocam, MdCheckCircle } from "react-icons/md";
import "./DemoPaymentPage.css";

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  const giftId = searchParams.get("giftId");
  const type = searchParams.get("type"); // "credit" for credit purchases
  const [status, setStatus] = useState(() => (ref ? "checking" : "no_ref"));
  const [attempts, setAttempts] = useState(0);
  const [paymentData, setPaymentData] = useState(null);

  const isCredit = type === "credit";

  useEffect(() => {
    if (!ref) return;

    let cancelled = false;
    const maxTries = 40;

    // Pick the right endpoint: credit purchases vs tier payments
    const endpoint = isCredit
      ? `${FUNCTIONS_BASE}/checkCreditPayment?ref=${encodeURIComponent(ref)}`
      : `${FUNCTIONS_BASE}/checkPaymentStatus?ref=${encodeURIComponent(ref)}`;

    async function poll() {
      let tries = 0;
      while (tries < maxTries && !cancelled) {
        tries++;
        setAttempts(tries);
        try {
          const r = await fetch(endpoint);
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
  }, [ref, isCredit]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "no_ref") {
    return (
      <div className="payment-status-page">
        <div className="status-icon"><MdHelp /></div>
        <h1>No reference provided</h1>
        <Link to="/">← Нүүр хуудас руу буцах</Link>
      </div>
    );
  }

  if (status === "paid") {
    // ── Gift payment receipt (new flow) ──
    if (isCredit) {
      const d = paymentData || {};
      const pType = d.purchaseType || "credit";

      if (pType === "gift") {
        const extraImages = d.extraImages || 0;
        const imgCost = d.imgCost || extraImages * EXTRA_IMAGE_PRICE;
        const videoCount = d.videoCount || 0;
        const vidCost = d.vidCost || videoCount * EXTRA_VIDEO_PRICE;
        const totalAmount = d.totalAmount || d.amount || 0;
        const gId = d.giftId || giftId;

        return (
          <div className="payment-status-page">
            <div className="status-icon" style={{ color: "#22c55e" }}><MdCelebration /></div>
            <h1>Төлбөр амжилттай!</h1>
            <p style={{ color: "#64748b", marginBottom: 24 }}>
              Таны мэндчилгээ идэвхжлээ <MdAutoAwesome />
            </p>

            <div className="receipt-card">
              <div className="receipt-header">
                <MdReceipt style={{ fontSize: 20 }} />
                <span>Төлбөрийн баримт</span>
              </div>

              {/* Base price */}
              <div className="receipt-row">
                <span className="receipt-label">🎁 Мэндчилгээ суурь</span>
                <span className="receipt-amount">₮{BASE_PRICE.toLocaleString()}</span>
              </div>
              <div className="receipt-detail">
                <span><MdPhotoCamera /> {INCLUDED_IMAGES} зураг орсон</span>
              </div>

              {/* Extra images */}
              {extraImages > 0 && (
                <div className="receipt-row receipt-row-extra">
                  <span className="receipt-label">
                    <MdPhotoCamera /> Нэмэлт зураг ×{extraImages}
                  </span>
                  <span className="receipt-amount">₮{imgCost.toLocaleString()}</span>
                </div>
              )}

              {/* Video clips */}
              {videoCount > 0 && (
                <div className="receipt-row receipt-row-extra">
                  <span className="receipt-label">
                    <MdVideocam /> Видео клип ×{videoCount}
                  </span>
                  <span className="receipt-amount">₮{vidCost.toLocaleString()}</span>
                </div>
              )}

              <div className="receipt-divider" />

              <div className="receipt-total">
                <span>Нийт төлсөн</span>
                <span className="receipt-total-amount">
                  ₮{totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="receipt-badge">
                <MdCheckCircle /> Төлбөр баталгаажсан
              </div>
            </div>

            {gId ? (
              <Link to={`/${gId}`} style={{ marginTop: 20 }}>← Мэндчилгээг харах</Link>
            ) : (
              <Link to="/" style={{ marginTop: 20 }}>← Нүүр хуудас руу буцах</Link>
            )}
          </div>
        );
      }

      // Legacy credit/plan receipt fallback
      const qty = d.quantity || 1;
      const totalAmount = d.totalAmount || d.amount || 0;
      return (
        <div className="payment-status-page">
          <div className="status-icon" style={{ color: "#22c55e" }}><MdCelebration /></div>
          <h1>Төлбөр амжилттай!</h1>
          <div className="receipt-card">
            <div className="receipt-header">
              <MdReceipt style={{ fontSize: 20 }} />
              <span>Төлбөрийн баримт</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Худалдан авалт</span>
              <span className="receipt-amount">₮{totalAmount.toLocaleString()}</span>
            </div>
            <div className="receipt-badge">
              <MdCheckCircle /> Төлбөр баталгаажсан
            </div>
          </div>
          <Link to="/" style={{ marginTop: 20 }}>← Нүүр хуудас руу буцах</Link>
        </div>
      );
    }

    // Tier purchase success (legacy)
    return (
      <div className="payment-status-page">
        <div className="status-icon"><MdCelebration /></div>
        <h1>Төлбөр амжилттай!</h1>
        <p>Таны мэндчилгээ идэвхжлээ.</p>
        {giftId ? (
          <Link to={`/${giftId}`}>← Мэндчилгээг харах</Link>
        ) : (
          <Link to="/">← Нүүр хуудас руу буцах</Link>
        )}
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="payment-status-page">
        <div className="status-icon"><MdSearch /></div>
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
      <div className="status-icon"><MdPayment /></div>
      <h1>Төлбөр шалгаж байна…</h1>
      <div className="loader-ring" style={{ width: 48, height: 48 }} />
      <p>Оролдлого {attempts} — түр хүлээнэ үү</p>
    </div>
  );
}
