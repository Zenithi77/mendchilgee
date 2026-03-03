// ═══════════════════════════════════════════════════════════════
// UpgradeModal — Use credits to activate gift / prompt purchase
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCredit } from "../services/creditService";
import {
  TIER_META,
} from "../config/tiers";
import { getRequiredTier, getUpgradeReasons } from "../utils/tierUtils";
import { MdAutoAwesome, MdCardGiftcard, MdShoppingCart } from "react-icons/md";
import "./UpgradeModal.css";

/**
 * UpgradeModal
 *
 * @param {boolean}  open     — show/hide
 * @param {Function} onClose  — close handler
 * @param {object}   gift     — current gift object
 * @param {string}   giftId   — Firestore document ID
 * @param {Function} onPurchase — open purchase modal
 * @param {Function} onActivated — called after successful credit use
 */
export default function UpgradeModal({ open, onClose, gift, giftId, onPurchase, onActivated }) {
  const { user, credits } = useAuth();
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

  if (!open) return null;

  async function handleUseCredit() {
    if (!user || !giftId) return;
    setLoading(true);
    setError(null);

    try {
      await useCredit(user.uid, giftId);
      onActivated?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Эрх ашиглахад алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  function handleBuyCredits() {
    onClose();
    onPurchase?.();
  }

  return (
    <div className="upgrade-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upgrade-modal-header">
          <div className="upgrade-modal-icon"><MdAutoAwesome /></div>
          <h2 className="upgrade-modal-title">Мэндчилгээг идэвхжүүлэх</h2>
          <p className="upgrade-modal-subtitle">
            Watermark арилгаж, бүх feature ашиглахын тулд 1 эрх шаардлагатай
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

        {/* Credits info */}
        <div className="upgrade-plan-box">
          <div className="upgrade-plan-row">
            <span className="upgrade-plan-label">
              <MdCardGiftcard style={{ verticalAlign: "middle", marginRight: 4 }} />
              Таны эрх
            </span>
            <span className={`upgrade-plan-value ${credits > 0 ? "upgrade-credits-ok" : "upgrade-credits-zero"}`}>
              {credits} эрх
            </span>
          </div>
          <div className="upgrade-plan-row">
            <span className="upgrade-plan-label">Шаардлагатай</span>
            <span className="upgrade-plan-value">1 эрх</span>
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
          {credits > 0 ? (
            <button
              className="upgrade-pay-btn"
              onClick={handleUseCredit}
              disabled={loading}
            >
              {loading ? (
                <span className="upgrade-loading">
                  <span className="upgrade-loading-spinner" />
                  Боловсруулж байна...
                </span>
              ) : (
                <>
                  <MdAutoAwesome style={{ marginRight: 6 }} />
                  1 эрх ашиглаж идэвхжүүлэх
                </>
              )}
            </button>
          ) : (
            <button
              className="upgrade-pay-btn"
              onClick={handleBuyCredits}
            >
              <MdShoppingCart style={{ marginRight: 6 }} />
              Эрх худалдаж авах (₮5,000)
            </button>
          )}
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
