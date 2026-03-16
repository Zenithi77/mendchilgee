// ═══════════════════════════════════════════════════════════════
// GiftCompletionModal — Save & pay flow
//
// Flow:
//   1. Save gift as draft
//   2. Count images/videos → calculate price
//   3. Show price breakdown → "Төлөх" button
//   4. Redirect to BYL checkout
//   5. If user has legacy credits → auto-activate for free
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCredit as consumeCredit } from "../services/creditService";
import { generateShapedQR, QR_SHAPES } from "../utils/heartQr";
import {
  BASE_PRICE,
  INCLUDED_IMAGES,
  EXTRA_IMAGE_PRICE,
  EXTRA_VIDEO_PRICE,
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

  // Steps: "saving" → "pricing" | "activated" | "paying"
  const [step, setStep] = useState("saving");
  const [error, setError] = useState(null);
  const [savedGiftId, setSavedGiftId] = useState(null);
  const [paying, setPaying] = useState(false);

  // Share state (for activated gifts)
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [shape, setShape] = useState("heart");
  const [qrColor, setQrColor] = useState("#e60023");
  const [copied, setCopied] = useState(false);

  const hasRun = useRef(false);

  const shareUrl = savedGiftId ? `${window.location.origin}/${savedGiftId}` : "";

  // Price calculation
  const { imageCount, videoCount } = countGiftMedia(gift);
  const pricing = calcGiftPrice(imageCount, videoCount);

  // ── Step 1: Save gift, then decide if free-activate or show price ──
  useEffect(() => {
    if (!open || !gift || !user) return;
    if (hasRun.current) return;
    hasRun.current = true;

    setStep("saving");
    setError(null);

    onSaveGift()
      .then((docId) => {
        if (!docId) throw new Error("Хадгалахад алдаа гарлаа");
        setSavedGiftId(docId);

        // Legacy: if user has credits, auto-activate for free
        if (credits > 0) {
          return consumeCredit(user.uid, docId).then(() => {
            setStep("activated");
            onGiftReload?.(docId);
          });
        }

        // Otherwise show price
        setStep("pricing");
      })
      .catch((err) => {
        console.error("Save failed:", err);
        setError(err.message || "Хадгалахад алдаа гарлаа");
        setStep("pricing");
      });
  }, [open, gift, user, credits, onSaveGift, onGiftReload]);

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

  // ── Pay button: create BYL checkout ──
  const handlePay = async () => {
    if (!user || !savedGiftId) return;
    setPaying(true);
    setError(null);

    try {
      const res = await fetch(`${FUNCTIONS_BASE}/createCreditCheckout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          type: "gift",
          giftId: savedGiftId,
          imageCount,
          videoCount,
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
      setPaying(false);
    }
  };

  // ── Reset on close ──
  const handleClose = useCallback(() => {
    hasRun.current = false;
    setStep("saving");
    setError(null);
    setSavedGiftId(null);
    setQrDataUrl(null);
    setCopied(false);
    setPaying(false);
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
            <p className="gc-loading-text">Мэндчилгээг хадгалж байна...</p>
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
                <span>🎁 Мэндчилгээ ({INCLUDED_IMAGES} зураг орсон)</span>
                <span>₮{BASE_PRICE.toLocaleString()}</span>
              </div>

              {pricing.extraImages > 0 && (
                <div className="gc-price-row gc-price-extra">
                  <span>
                    <MdPhotoCamera /> Нэмэлт зураг ×{pricing.extraImages}
                  </span>
                  <span>₮{pricing.imgCost.toLocaleString()}</span>
                </div>
              )}

              {pricing.videoCount > 0 && (
                <div className="gc-price-row gc-price-extra">
                  <span>
                    <MdVideocam /> Видео бичлэг ×{pricing.videoCount}
                  </span>
                  <span>₮{pricing.vidCost.toLocaleString()}</span>
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

            <button className="gc-later-btn" onClick={handleClose}>
              Дараа болох
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
