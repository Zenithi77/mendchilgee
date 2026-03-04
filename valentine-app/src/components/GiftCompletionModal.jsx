// ═══════════════════════════════════════════════════════════════
// GiftCompletionModal — Shown after user finishes creating a gift.
//
// Flow:
//   1. Save gift → show "Мэндчилгээ амжилттай боллоо!" screen
//   2. If user has credits → auto-deduct 1, show share link + QR
//   3. If no credits → prompt to buy credits
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCredit as consumeCredit } from "../services/creditService";
import { generateShapedQR, QR_SHAPES } from "../utils/heartQr";
import {
  MdClose,
  MdCheck,
  MdContentCopy,
  MdDownload,
  MdShoppingCart,
  MdAutoAwesome,
  MdCelebration,
  MdFavorite,
} from "react-icons/md";
import "./GiftCompletionModal.css";

const SHAPES = QR_SHAPES.map((s) => ({
  key: s.id,
  label: s.label.replace(/^[^\s]+\s/, ""),
  icon: s.label.split(" ")[0],
}));

/**
 * GiftCompletionModal
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {string}   giftId
 * @param {Function} onPurchase   — opens the PurchaseModal
 * @param {Function} onGiftReload — reload gift after activation
 */
export default function GiftCompletionModal({
  open,
  onClose,
  giftId,
  onPurchase,
  onGiftReload,
}) {
  const { user, credits } = useAuth();

  // Steps: "activating" → "activated" | "no-credits"
  const [step, setStep] = useState("activating");
  const [error, setError] = useState(null);

  // Share state
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [shape, setShape] = useState("heart");
  const [copied, setCopied] = useState(false);

  const hasActivated = useRef(false);

  const shareUrl = giftId ? `${window.location.origin}/${giftId}` : "";

  // ── Step 1: Try to activate (use credit) when modal opens ──
  useEffect(() => {
    if (!open || !giftId || !user) return;
    if (hasActivated.current) return;

    hasActivated.current = true;

    if (credits > 0) {
      // Use 1 credit to activate
      setStep("activating");
      setError(null);
      consumeCredit(user.uid, giftId)
        .then(() => {
          setStep("activated");
          onGiftReload?.();
        })
        .catch((err) => {
          console.error("Activation failed:", err);
          setError(err.message || "Эрх ашиглахад алдаа гарлаа");
          setStep("no-credits");
        });
    } else {
      setStep("no-credits");
    }
  }, [open, giftId, user, credits, onGiftReload]);

  // ── Generate QR when activated ──
  useEffect(() => {
    if (step !== "activated" || !shareUrl) return;
    let cancelled = false;
    setQrDataUrl(null);
    setQrGenerating(true);

    generateShapedQR(shareUrl, { size: 600, color: "#e60023", shape })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
          setQrGenerating(false);
        }
      })
      .catch(() => {
        if (!cancelled) setQrGenerating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, shareUrl, shape]);

  // ── Reset on close ──
  const handleClose = useCallback(() => {
    hasActivated.current = false;
    setStep("activating");
    setError(null);
    setQrDataUrl(null);
    setCopied(false);
    onClose();
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `mendchilgee-qr-${shape}.png`;
    a.click();
  };

  const handleBuyCredits = () => {
    handleClose();
    onPurchase?.();
  };

  if (!open) return null;

  return (
    <div className="gc-overlay" onClick={handleClose}>
      <div className="gc-modal" onClick={(e) => e.stopPropagation()}>
        <button className="gc-close" onClick={handleClose}>
          <MdClose />
        </button>

        {/* ── Step: Activating (loading) ── */}
        {step === "activating" && (
          <div className="gc-body gc-center">
            <div className="gc-spinner-wrap">
              <span className="gc-spinner" />
            </div>
            <p className="gc-loading-text">Мэндчилгээг идэвхжүүлж байна...</p>
          </div>
        )}

        {/* ── Step: Successfully activated ── */}
        {step === "activated" && (
          <div className="gc-body">
            {/* Success header */}
            <div className="gc-success-header">
              <div className="gc-success-icon">
                <MdCelebration />
              </div>
              <h2 className="gc-success-title font-script">
                Мэндчилгээ амжилттай боллоо!
              </h2>
              <p className="gc-success-subtitle">
                Одоо линк эсвэл QR код ашиглаж хуваалцаарай
              </p>
            </div>

            {/* Share link */}
            <div className="gc-link-section">
              <label className="gc-link-label">Мэндчилгээний линк</label>
              <div className="gc-link-row">
                <input
                  className="gc-link-input"
                  value={shareUrl}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
                <button className="gc-link-copy" onClick={handleCopy}>
                  {copied ? <MdCheck /> : <MdContentCopy />}
                </button>
              </div>
              {copied && <span className="gc-copied-badge">Хуулагдлаа!</span>}
            </div>

            {/* QR Shape selector */}
            <div className="gc-qr-section">
              <div className="gc-shape-selector">
                {SHAPES.map((s) => (
                  <button
                    key={s.key}
                    className={`gc-shape-btn ${shape === s.key ? "gc-shape-active" : ""}`}
                    onClick={() => setShape(s.key)}
                    title={s.label}
                  >
                    <span className="gc-shape-icon">{s.icon}</span>
                  </button>
                ))}
              </div>

              {/* QR Code */}
              <div className="gc-qr-display">
                {qrDataUrl && !qrGenerating ? (
                  <img src={qrDataUrl} alt="QR Code" className="gc-qr-img" />
                ) : (
                  <div className="gc-qr-loading">
                    <MdFavorite className="gc-qr-loading-icon" />
                    <p>QR үүсгэж байна...</p>
                  </div>
                )}
              </div>

              <button
                className="gc-download-btn"
                onClick={handleDownloadQR}
                disabled={!qrDataUrl}
              >
                <MdDownload /> QR татах
              </button>
            </div>
          </div>
        )}

        {/* ── Step: No credits ── */}
        {step === "no-credits" && (
          <div className="gc-body gc-center">
            <div className="gc-nocredit-header">
              <div className="gc-nocredit-icon">
                <MdAutoAwesome />
              </div>
              <h2 className="gc-nocredit-title font-script">
                Мэндчилгээ амжилттай үүслээ!
              </h2>
              <p className="gc-nocredit-subtitle">
                Мэндчилгээг идэвхжүүлж, линк авахын тулд 1 эрх шаардлагатай
              </p>
            </div>

            {error && (
              <p className="gc-error">{error}</p>
            )}

            <div className="gc-nocredit-info">
              <div className="gc-nocredit-row">
                <span>Таны эрх</span>
                <span className="gc-nocredit-zero">0 эрх</span>
              </div>
              <div className="gc-nocredit-row">
                <span>Шаардлагатай</span>
                <span className="gc-nocredit-need">1 эрх</span>
              </div>
            </div>

            <button className="gc-buy-btn" onClick={handleBuyCredits}>
              <MdShoppingCart style={{ marginRight: 6 }} />
              Эрх худалдаж авах (₮5,000)
            </button>

            <button className="gc-later-btn" onClick={handleClose}>
              Дараа болох
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
