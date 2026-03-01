// ═══════════════════════════════════════════════════════════════
// UpgradeModal — Explains required tier & triggers BYL payment
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import {
  TIER_META,
  TIER_DURATION_DAYS,
  TIER_DISPLAY_PRICE,
} from "../config/tiers";
import { getRequiredTier, getUpgradeReasons } from "../utils/tierUtils";
import { MdAutoAwesome } from "react-icons/md";
import "./UpgradeModal.css";

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

/**
 * UpgradeModal
 *
 * @param {boolean}  open     — show/hide
 * @param {Function} onClose  — close handler
 * @param {object}   gift     — current gift object
 * @param {string}   giftId   — Firestore document ID
 */
export default function UpgradeModal({ open, onClose, gift, giftId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requiredTier = useMemo(
    () => getRequiredTier(gift?.sections),
    [gift?.sections],
  );

  const reasons = useMemo(
    () => getUpgradeReasons(gift?.sections),
    [gift?.sections],
  );

  const tierMeta = TIER_META[requiredTier];
  const durationDays = TIER_DURATION_DAYS[requiredTier];
  const displayPrice = TIER_DISPLAY_PRICE[requiredTier] || "Үнэгүй";

  if (!open) return null;

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      // Map tier to backend plan name
      const plan = requiredTier; // "standard" or "premium"

      const res = await fetch(`${FUNCTIONS_BASE}/createBylCheckout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          giftId,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error(json);
        setError("Төлбөрийн систем алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }

      // Redirect to BYL checkout page
      window.location.href = json.checkoutUrl;
    } catch (err) {
      console.error(err);
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upgrade-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upgrade-modal-header">
          <div className="upgrade-modal-icon"><MdAutoAwesome /></div>
          <h2 className="upgrade-modal-title">Watermark арилгах</h2>
          <p className="upgrade-modal-subtitle">
            Таны мэндчилгээнд дараах feature-ууд ашиглагдсан тул upgrade шаардлагатай
          </p>
        </div>

        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="upgrade-reasons">
            <div className="upgrade-reasons-title">Ашиглагдсан feature-ууд</div>
            {reasons.map((reason, i) => {
              const rMeta = TIER_META[reason.requiredTier];
              return (
                <div key={i} className="upgrade-reason-item">
                  <span className="upgrade-reason-icon">{reason.icon}</span>
                  <span className="upgrade-reason-label">{reason.labelMn}</span>
                  <span
                    className="upgrade-reason-tier"
                    style={{
                      background: rMeta.bgColor,
                      color: rMeta.color,
                    }}
                  >
                    {rMeta.badge} {rMeta.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Plan info */}
        <div className="upgrade-plan-box">
          <div className="upgrade-plan-row">
            <span className="upgrade-plan-label">Төлөвлөгөө</span>
            <span className="upgrade-plan-value">
              {tierMeta.badge} {tierMeta.label}
            </span>
          </div>
          <div className="upgrade-plan-row">
            <span className="upgrade-plan-label">Идэвхтэй хугацаа</span>
            <span className="upgrade-plan-value">{durationDays} хоног</span>
          </div>
          <div className="upgrade-plan-row">
            <span className="upgrade-plan-label">Үнэ</span>
            <span className="upgrade-plan-value upgrade-plan-price">
              {displayPrice}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "0 28px", marginBottom: 8 }}>
            <p style={{ color: "#ef4444", fontSize: "0.82rem", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="upgrade-actions">
          <button
            className="upgrade-pay-btn"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? (
              <span className="upgrade-loading">
                <span className="upgrade-loading-spinner" />
                Боловсруулж байна...
              </span>
            ) : (
              `Төлбөр төлөх — ${displayPrice}`
            )}
          </button>
          <button
            className="upgrade-cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Дараа болох
          </button>
        </div>
      </div>
    </div>
  );
}
