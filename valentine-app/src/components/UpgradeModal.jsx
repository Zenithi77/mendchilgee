// ═══════════════════════════════════════════════════════════════
// UpgradeModal — Pay to activate a gift (or use legacy credit)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCredit } from "../services/creditService";
import {
  BASE_PRICE,
  EXTRA_IMAGE_PRICE,
  EXTRA_VIDEO_PRICE,
  VIDEO_CHUNK_SECONDS,
  countGiftMedia,
  calcGiftPrice,
} from "../config/plans";
import { MdAutoAwesome, MdPhotoCamera, MdVideocam } from "react-icons/md";
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
 * @param {Function} onActivated — called after successful credit use
 */
export default function UpgradeModal({ open, onClose, gift, giftId, onActivated }) {
  const { user, credits } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { imageCount, totalVideoSeconds } = useMemo(
    () => countGiftMedia(gift),
    [gift],
  );

  const pricing = useMemo(
    () => calcGiftPrice(imageCount, totalVideoSeconds),
    [imageCount, totalVideoSeconds],
  );

  if (!open) return null;

  // Legacy: use existing credit
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
      setError(err.message || "Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  // New: redirect to BYL payment
  async function handlePay() {
    if (!user || !giftId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${FUNCTIONS_BASE}/createCreditCheckout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          type: "gift",
          giftId,
          imageCount,
          totalVideoSeconds,
          totalAmount: pricing.total,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || "Checkout үүсгэхэд алдаа");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      setError(err.message || "Төлбөр эхлүүлэхэд алдаа гарлаа.");
      setLoading(false);
    }
  }

  return (
    <div className="upgrade-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upgrade-modal-header">
          <div className="upgrade-modal-icon"><MdAutoAwesome /></div>
          <h2 className="upgrade-modal-title">Мэндчилгээг идэвхжүүлэх</h2>
          <p className="upgrade-modal-subtitle">
            Төлбөр төлсөнөөр мэндчилгээ идэвхждэг
          </p>
        </div>

        {/* Price breakdown */}
        <div className="upgrade-plan-box">
          <div className="upgrade-plan-row">
            <span className="upgrade-plan-label">🎁 Мэндчилгээ суурь</span>
            <span className="upgrade-plan-value">₮{BASE_PRICE.toLocaleString()}</span>
          </div>
          {pricing.imageCount > 0 && (
            <div className="upgrade-plan-row" style={{ fontSize: "0.85rem", color: "#64748b" }}>
              <span className="upgrade-plan-label">
                <MdPhotoCamera style={{ verticalAlign: "middle", marginRight: 4 }} />
                Зураг ×{pricing.imageCount}
              </span>
              <span className="upgrade-plan-value">+₮{pricing.imgCost.toLocaleString()}</span>
            </div>
          )}
          {pricing.videoChunks > 0 && (
            <div className="upgrade-plan-row" style={{ fontSize: "0.85rem", color: "#64748b" }}>
              <span className="upgrade-plan-label">
                <MdVideocam style={{ verticalAlign: "middle", marginRight: 4 }} />
                Бичлэг {pricing.totalVideoSeconds}сек ({pricing.videoChunks}×{VIDEO_CHUNK_SECONDS}с)
              </span>
              <span className="upgrade-plan-value">+₮{pricing.vidCost.toLocaleString()}</span>
            </div>
          )}
          <div className="upgrade-plan-row" style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 4, fontWeight: 700 }}>
            <span className="upgrade-plan-label">Нийт</span>
            <span className="upgrade-plan-value" style={{ color: "#e11d48", fontSize: "1.1rem" }}>
              ₮{pricing.total.toLocaleString()}
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
                  Эрх ашиглаж идэвхжүүлэх ({credits} эрх байна)
                </>
              )}
            </button>
          ) : (
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
                <>
                  <MdAutoAwesome style={{ marginRight: 6 }} />
                  ₮{pricing.total.toLocaleString()} төлөх
                </>
              )}
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
