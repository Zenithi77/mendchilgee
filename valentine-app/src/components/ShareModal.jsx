import { useState, useEffect, useRef } from "react";
import { generateHeartQR } from "../utils/heartQr";

/**
 * ShareModal — Shows a heart-shaped QR code + share link for a gift.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - giftId: string
 *  - giftTitle: string
 */
export default function ShareModal({ open, onClose, giftId, giftTitle }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const shareUrl = `${window.location.origin}/preview/${giftId}`;

  useEffect(() => {
    if (!open || !giftId) return;
    let cancelled = false;
    setQrDataUrl(null);

    generateHeartQR(shareUrl, { size: 480, color: "#e60023" })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR generation failed:", err);
      });

    return () => { cancelled = true; };
  }, [open, giftId, shareUrl]);

  if (!open) return null;

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
    a.download = `valentine-gift-qr.png`;
    a.click();
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>✕</button>

        <div className="share-modal-header">
          <span className="share-modal-emoji">💝</span>
          <h2 className="share-modal-title">Бэлэг хуваалцах</h2>
          <p className="share-modal-subtitle">{giftTitle}</p>
        </div>

        {/* QR Code */}
        <div className="share-modal-qr">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Heart QR Code"
              className="share-modal-qr-img"
              ref={canvasRef}
            />
          ) : (
            <div className="share-modal-qr-loading">
              <span>❤️</span>
              <p>QR үүсгэж байна...</p>
            </div>
          )}
        </div>

        <p className="share-modal-hint">QR код уншуулж бэлгээ нээнэ үү</p>

        {/* Link */}
        <div className="share-modal-link-row">
          <input
            className="share-modal-link-input"
            value={shareUrl}
            readOnly
            onClick={(e) => e.target.select()}
          />
          <button className="share-modal-link-copy" onClick={handleCopy}>
            {copied ? "✓" : "📋"}
          </button>
        </div>

        {/* Actions */}
        <div className="share-modal-actions">
          <button className="share-modal-btn share-modal-btn-download" onClick={handleDownloadQR} disabled={!qrDataUrl}>
            ⬇️ QR татах
          </button>
          <button className="share-modal-btn share-modal-btn-close" onClick={onClose}>
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}
