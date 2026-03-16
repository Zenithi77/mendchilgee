// ═══════════════════════════════════════════════════════════════
// GiftCompletionModal — Save & pay flow
//
// Flow:
//   1. Show price breakdown (NO save yet)
//   2. "Төлөх" → save gift → create BYL checkout → redirect
//   3. "Болих" → show warning → "Ойлголоо" → navigate home
//   4. If user has legacy credits → save + auto-activate
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCredit as consumeCredit } from "../services/creditService";
import { generateShapedQR, QR_SHAPES } from "../utils/heartQr";
import {
  BASE_PRICE,
  EXTRA_IMAGE_PRICE,
  EXTRA_VIDEO_PRICE,
  VIDEO_CHUNK_SECONDS,
  INCLUDED_VIDEO_SECONDS,
  countGiftMedia,
  calcGiftPrice,
} from "../config/plans";
import {
  MdClose,
  MdCheck,
  MdContentCopy,
  MdDownload,
  MdPrint,
  MdPayment,
  MdAutoAwesome,
  MdCelebration,
  MdFavorite,
  MdPhotoCamera,
  MdVideocam,
  MdReceipt,
  MdWarning,
} from "react-icons/md";
import "./GiftCompletionModal.css";

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

const SHAPES = QR_SHAPES.map((s) => ({
  key: s.id,
  label: s.label.replace(/^[^\s]+\s/, ""),
  icon: s.label.split(" ")[0],
}));

const QR_COLORS = [
  { color: "#e60023", label: "Улаан" },
  { color: "#d63384", label: "Ягаан" },
  { color: "#9b59b6", label: "Нил ягаан" },
  { color: "#2563eb", label: "Цэнхэр" },
  { color: "#059669", label: "Ногоон" },
  { color: "#d97706", label: "Шар" },
  { color: "#1a0e12", label: "Хар" },
  { color: "#6b8f9e", label: "Саарал" },
];

/**
 * GiftCompletionModal
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {object}   gift         — full gift object (NOT yet saved)
 * @param {Function} onSaveGift   — async fn that saves & returns docId
 * @param {Function} onGiftReload — reload gift after activation
 */
export default function GiftCompletionModal({
  open,
  onClose,
  gift,
  onSaveGift,
  onGiftReload,
}) {
  const { user, credits } = useAuth();
  const navigate = useNavigate();

  // Steps: "pricing" → "saving" → "paying" | "activated" | "warning"
  const [step, setStep] = useState("pricing");
  const [error, setError] = useState(null);
  const [savedGiftId, setSavedGiftId] = useState(null);
  const [paying, setPaying] = useState(false);

  // Share state (for activated gifts)
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [shape, setShape] = useState("heart");
  const [qrColor, setQrColor] = useState("#e60023");
  const [copied, setCopied] = useState(false);

  const shareUrl = savedGiftId ? `${window.location.origin}/${savedGiftId}` : "";

  // Price calculation
  const { imageCount, totalVideoSeconds } = countGiftMedia(gift);
  const pricing = calcGiftPrice(imageCount, totalVideoSeconds);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep("pricing");
      setError(null);
      setSavedGiftId(null);
      setPaying(false);
      setQrDataUrl(null);
      setCopied(false);
    }
  }, [open]);

  // ── Generate QR when activated ──
  useEffect(() => {
    if (step !== "activated" || !shareUrl) return;
    let cancelled = false;
    setQrDataUrl(null);
    setQrGenerating(true);

    generateShapedQR(shareUrl, { size: 400, color: qrColor, shape })
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
  }, [step, shareUrl, shape, qrColor]);

  // ── Pay button: save gift FIRST, then create BYL checkout ──
  const handlePay = async () => {
    if (!user || !gift) return;
    setPaying(true);
    setError(null);
    setStep("saving");

    try {
      // Step 1: Save gift to Firestore
      const docId = await onSaveGift();
      if (!docId) throw new Error("Хадгалахад алдаа гарлаа");
      setSavedGiftId(docId);

      // Legacy: if user has credits, auto-activate for free
      if (credits > 0) {
        await consumeCredit(user.uid, docId);
        setStep("activated");
        onGiftReload?.(docId);
        setPaying(false);
        return;
      }

      // Step 2: Create BYL checkout
      const res = await fetch(`${FUNCTIONS_BASE}/createCreditCheckout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          type: "gift",
          giftId: docId,
          imageCount,
          totalVideoSeconds,
          totalAmount: pricing.total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Төлбөр үүсгэхэд алдаа гарлаа");

      // Redirect to BYL checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message);
      setStep("pricing");
      setPaying(false);
    }
  };

  // ── Cancel button: show warning ──
  const handleCancel = useCallback(() => {
    setStep("warning");
  }, []);

  // ── Warning: user confirms leaving ──
  const handleConfirmLeave = useCallback(() => {
    onClose();
    navigate("/");
  }, [onClose, navigate]);

  // ── Warning: user goes back to pricing ──
  const handleBackToPricing = useCallback(() => {
    setStep("pricing");
  }, []);

  // ── Reset on close ──
  const handleClose = useCallback(() => {
    // If on pricing or warning, show warning first
    if (step === "pricing") {
      setStep("warning");
      return;
    }
    setStep("pricing");
    setError(null);
    setSavedGiftId(null);
    setQrDataUrl(null);
    setCopied(false);
    setPaying(false);
    onClose();
  }, [onClose, step]);

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

  const handlePrintQR = () => {
    if (!qrDataUrl) return;
    const title = gift?.recipientName || "Мэндчилгээ";
    const w = window.open("", "_blank", "width=500,height=600");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>QR - ${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Georgia,serif;color:#333;text-align:center;padding:24px}
img{max-width:320px;max-height:320px;margin-bottom:16px}
h3{font-size:1.1rem;margin-bottom:6px}
p{font-size:0.82rem;color:#888;word-break:break-all}
@media print{body{padding:0}img{max-width:280px}}</style></head>
<body><img src="${qrDataUrl}" alt="QR"/><h3>${title}</h3><p>${shareUrl}</p>
<script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script></body></html>`);
    w.document.close();
  };

  if (!open) return null;

  return (
    <div className="gc-overlay" onClick={handleClose}>
      <div className="gc-modal" onClick={(e) => e.stopPropagation()}>
        <button className="gc-close" onClick={handleClose}>
          <MdClose />
        </button>

        {/* ── Step: Saving (loading) ── */}
        {step === "saving" && (
          <div className="gc-body gc-center">
            <div className="gc-spinner-wrap">
              <span className="gc-spinner" />
            </div>
            <p className="gc-loading-text">Мэндчилгээг хадгалж, төлбөр үүсгэж байна...</p>
          </div>
        )}

        {/* ── Step: Warning before leaving ── */}
        {step === "warning" && (
          <div className="gc-body gc-center">
            <div className="gc-nocredit-header">
              <div className="gc-nocredit-icon" style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}>
                <MdWarning />
              </div>
              <h2 className="gc-nocredit-title font-script" style={{ color: "#d97706" }}>
                Анхааруулга!
              </h2>
              <p className="gc-nocredit-subtitle" style={{ color: "#92400e", lineHeight: 1.6 }}>
                Төлбөр төлөхгүй бол мэндчилгээ <strong>үүсэхгүй</strong> бөгөөд
                таны оруулсан зураг, бичлэг, бичвэр зэрэг бүх зүйлс
                <strong> устахыг</strong> анхаарна уу.
              </p>
            </div>

            <button
              className="gc-buy-btn"
              onClick={handleBackToPricing}
              style={{ marginTop: 16 }}
            >
              <MdPayment style={{ marginRight: 6 }} />
              Буцаж төлбөр төлөх
            </button>

            <button
              className="gc-later-btn"
              onClick={handleConfirmLeave}
              style={{ color: "#dc2626", fontWeight: 600 }}
            >
              Ойлголоо, гарах
            </button>
          </div>
        )}

        {/* ── Step: Show price & pay ── */}
        {step === "pricing" && (
          <div className="gc-body gc-center">
            <div className="gc-nocredit-header">
              <div className="gc-nocredit-icon">
                <MdAutoAwesome />
              </div>
              <h2 className="gc-nocredit-title font-script">
                Мэндчилгээ бэлэн боллоо!
              </h2>
              <p className="gc-nocredit-subtitle">
                Төлбөр төлж идэвхжүүлээрэй
              </p>
            </div>

            {error && <p className="gc-error">{error}</p>}

            {/* ── Price Breakdown ── */}
            <div className="gc-price-card">
              <div className="gc-price-header">
                <MdReceipt style={{ fontSize: 18 }} />
                <span>Үнийн мэдээлэл</span>
              </div>

              <div className="gc-price-row">
                <span>🎁 Мэндчилгээ суурь ({INCLUDED_VIDEO_SECONDS} сек бичлэг орсон)</span>
                <span>₮{BASE_PRICE.toLocaleString()}</span>
              </div>

              {pricing.imageCount > 0 && (
                <div className="gc-price-row gc-price-extra">
                  <span>
                    <MdPhotoCamera /> Зураг ×{pricing.imageCount} (₮{EXTRA_IMAGE_PRICE}/зураг)
                  </span>
                  <span>+₮{pricing.imgCost.toLocaleString()}</span>
                </div>
              )}

              {pricing.totalVideoSeconds > 0 && pricing.totalVideoSeconds <= INCLUDED_VIDEO_SECONDS && (
                <div className="gc-price-row gc-price-extra" style={{ color: "#10b981" }}>
                  <span>
                    <MdVideocam /> Бичлэг {pricing.totalVideoSeconds} сек
                  </span>
                  <span>Үнэгүй</span>
                </div>
              )}

              {pricing.extraVideoSeconds > 0 && (
                <div className="gc-price-row gc-price-extra">
                  <span>
                    <MdVideocam /> Нэмэлт бичлэг +{pricing.extraVideoSeconds} сек ({pricing.videoChunks}×{VIDEO_CHUNK_SECONDS}с = ₮{EXTRA_VIDEO_PRICE}/блок)
                  </span>
                  <span>+₮{pricing.vidCost.toLocaleString()}</span>
                </div>
              )}

              <div className="gc-price-divider" />

              <div className="gc-price-total">
                <span>Нийт</span>
                <span className="gc-price-total-amount">
                  ₮{pricing.total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              className="gc-buy-btn"
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? (
                <span className="gc-spinner" style={{ width: 20, height: 20 }} />
              ) : (
                <>
                  <MdPayment style={{ marginRight: 6 }} />
                  ₮{pricing.total.toLocaleString()} төлөх
                </>
              )}
            </button>

            <button className="gc-later-btn" onClick={handleCancel}>
              Болих
            </button>
          </div>
        )}

        {/* ── Step: Successfully activated ── */}
        {step === "activated" && (
          <div className="gc-body">
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

              {/* Color selector */}
              <div className="gc-color-selector">
                {QR_COLORS.map((c) => (
                  <button
                    key={c.color}
                    className={`gc-color-btn ${qrColor === c.color ? "gc-color-active" : ""}`}
                    style={{ background: c.color }}
                    onClick={() => setQrColor(c.color)}
                    title={c.label}
                    aria-label={c.label}
                  />
                ))}
              </div>

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

              <div className="gc-qr-actions">
                <button
                  className="gc-download-btn"
                  onClick={handleDownloadQR}
                  disabled={!qrDataUrl}
                >
                  <MdDownload /> Татах
                </button>
                <button
                  className="gc-print-btn"
                  onClick={handlePrintQR}
                  disabled={!qrDataUrl}
                >
                  <MdPrint /> Хэвлэх
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
