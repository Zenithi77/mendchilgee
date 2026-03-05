import { useState, useEffect, useRef } from "react";
import { MdClose, MdFavorite, MdCheck, MdContentCopy, MdDownload, MdPrint } from "react-icons/md";
import { generateShapedQR, QR_SHAPES } from "../utils/heartQr";

const SHAPES = QR_SHAPES.map((s) => ({
  key: s.id,
  label: s.label.replace(/^[^\s]+\s/, ""),   // strip emoji prefix
  icon: s.label.split(" ")[0],                // emoji char
}));

/**
 * ShareModal — Shows a QR code (with selectable shape frame) + share link.
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
  const [shape, setShape] = useState("heart");
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef(null);

  const shareUrl = `${window.location.origin}/${giftId}`;

  // Regenerate QR whenever open / shape / giftId changes
  useEffect(() => {
    if (!open || !giftId) return;
    let cancelled = false;
    setQrDataUrl(null);
    setGenerating(true);

    generateShapedQR(shareUrl, { size: 400, color: "#e60023", shape })
      .then((url) => {
        if (!cancelled) { setQrDataUrl(url); setGenerating(false); }
      })
      .catch((err) => {
        console.error("QR generation failed:", err);
        if (!cancelled) setGenerating(false);
      });

    return () => { cancelled = true; };
  }, [open, giftId, shareUrl, shape]);

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
    a.download = `mendchilgee-qr-${shape}.png`;
    a.click();
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    const w = window.open("", "_blank", "width=500,height=600");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>QR - ${giftTitle || "Мэндчилгээ"}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Georgia,serif;color:#333;text-align:center;padding:24px}
img{max-width:320px;max-height:320px;margin-bottom:16px}
h3{font-size:1.1rem;margin-bottom:6px}
p{font-size:0.82rem;color:#888;word-break:break-all}
@media print{body{padding:0}img{max-width:280px}}</style></head>
<body><img src="${qrDataUrl}" alt="QR"/><h3>${giftTitle || "Мэндчилгээ"}</h3><p>${shareUrl}</p>
<script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>
          <MdClose />
        </button>

        <div className="share-modal-header">
          <span className="share-modal-emoji"><MdFavorite /></span>
          <h2 className="share-modal-title">Мэндчилгээ хуваалцах</h2>
          <p className="share-modal-subtitle">{giftTitle}</p>
        </div>

        {/* Shape selector */}
        <div className="share-shape-selector">
          {SHAPES.map((s) => (
            <button
              key={s.key}
              className={`share-shape-btn ${shape === s.key ? "share-shape-active" : ""}`}
              onClick={() => setShape(s.key)}
              title={s.label}
            >
              <span className="share-shape-icon">{s.icon}</span>
              <span className="share-shape-label">{s.label}</span>
            </button>
          ))}
        </div>

        {/* QR Code */}
        <div className="share-modal-qr">
          {qrDataUrl && !generating ? (
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="share-modal-qr-img"
              ref={canvasRef}
            />
          ) : (
            <div className="share-modal-qr-loading">
              <span><MdFavorite /></span>
              <p>QR үүсгэж байна...</p>
            </div>
          )}
        </div>

        <p className="share-modal-hint">QR код уншуулж мэндчилгээг нээнэ үү</p>

        {/* Link */}
        <div className="share-modal-link-row">
          <input
            className="share-modal-link-input"
            value={shareUrl}
            readOnly
            onClick={(e) => e.target.select()}
          />
          <button className="share-modal-link-copy" onClick={handleCopy}>
            {copied ? <MdCheck /> : <MdContentCopy />}
          </button>
        </div>

        {/* Actions */}
        <div className="share-modal-actions">
          <button
            className="share-modal-btn share-modal-btn-download"
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
          >
            <MdDownload /> QR татах
          </button>
          <button
            className="share-modal-btn share-modal-btn-print"
            onClick={handlePrint}
            disabled={!qrDataUrl}
          >
            <MdPrint /> Хэвлэх
          </button>
          <button
            className="share-modal-btn share-modal-btn-close"
            onClick={onClose}
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}
