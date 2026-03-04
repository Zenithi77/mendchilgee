// ═══════════════════════════════════════════════════════════════
// PromoCodeModal — Enter promo code by text or scan QR
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { redeemPromoCode } from "../services/creditService";
import {
  MdClose,
  MdQrCodeScanner,
  MdImage,
  MdCheckCircle,
  MdError,
} from "react-icons/md";
import "./PromoCodeModal.css";

export default function PromoCodeModal({ open, onClose, onSuccess }) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const scannerDivRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
      } catch { /* noop */ }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setResult(null);
      setCode("");
      setScanning(false);
    }
  }, [open, stopCamera]);

  const handleSubmitCode = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await redeemPromoCode(code.trim(), user.uid);
      setResult({
        type: "success",
        message: `Амжилттай! Таны эрх: ${data.newCredits}`,
      });
      onSuccess?.(data.newCredits);
    } catch (err) {
      const msg = err.message?.includes("fetch") || err.message?.includes("network")
        ? "Интернет холболтоо шалгана уу"
        : err.message;
      setResult({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleQRResult = useCallback(
    async (decodedText) => {
      if (loading) return;

      let promoCode = decodedText;
      try {
        const url = new URL(decodedText);
        const match = url.pathname.match(/\/promo\/(.+)/);
        if (match) promoCode = decodeURIComponent(match[1]);
      } catch {
        // Not a URL, use as-is
      }

      stopCamera();
      setLoading(true);
      setResult(null);
      try {
        const data = await redeemPromoCode(promoCode, user.uid);
        setResult({
          type: "success",
          message: `Амжилттай! Таны эрх: ${data.newCredits}`,
        });
        onSuccess?.(data.newCredits);
      } catch (err) {
        const msg = err.message?.includes("fetch") || err.message?.includes("network")
          ? "Интернет холболтоо шалгана уу"
          : err.message;
        setResult({ type: "error", message: msg });
      } finally {
        setLoading(false);
      }
    },
    [user, loading, onSuccess, stopCamera],
  );

  const startCamera = useCallback(async () => {
    setResult(null);
    // Show the scanner area first so the container has dimensions
    setScanning(true);

    // Wait for React to render the visible scanner div
    await new Promise((r) => setTimeout(r, 100));

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scannerId = "promo-qr-scanner";

      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch { /* noop */ }
      }

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        (decodedText) => {
          handleQRResult(decodedText);
        },
        () => {},
      );
    } catch (err) {
      console.error("Camera error:", err);
      setScanning(false);
      setResult({
        type: "error",
        message: "Камер нээхэд алдаа гарлаа. Камерын зөвшөөрөл өгнө үү.",
      });
    }
  }, [handleQRResult]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setLoading(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("promo-qr-file-scanner");
      const result = await scanner.scanFile(file, true);
      await scanner.clear();
      handleQRResult(result);
    } catch (err) {
      console.error("QR file scan error:", err);
      setResult({
        type: "error",
        message: "QR код уншихад алдаа гарлаа. Зургаа шалгана уу.",
      });
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="promo-overlay" onClick={onClose}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="promo-header">
          <h2 className="promo-title">🎟️ Промо код</h2>
          <div className="promo-header-actions">
            <button
              className="promo-qr-icon-btn"
              onClick={scanning ? stopCamera : startCamera}
              title="QR уншуулах"
              disabled={loading}
            >
              <MdQrCodeScanner />
            </button>
            <button className="promo-close" onClick={onClose}>
              <MdClose />
            </button>
          </div>
        </div>

        <div className="promo-content">
          {/* Input row */}
          <p className="promo-hint">Промо кодоо оруулах эсвэл QR уншуулна уу</p>
          <div className="promo-input-row">
            <input
              type="text"
              className="promo-input"
              placeholder="PROMO2025"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitCode()}
              disabled={loading}
              autoFocus
            />
            <button
              className="promo-submit-btn"
              onClick={handleSubmitCode}
              disabled={loading || !code.trim()}
            >
              {loading ? <span className="promo-spinner" /> : "Ашиглах"}
            </button>
          </div>

          {/* QR Scanner area */}
          {scanning && (
            <div className="promo-scanner-wrap">
              <div className="promo-scanner-area" ref={scannerDivRef}>
                <div id="promo-qr-scanner" />
                {/* Scan frame overlay */}
                <div className="promo-scan-frame">
                  <span className="promo-scan-corner promo-scan-tl" />
                  <span className="promo-scan-corner promo-scan-tr" />
                  <span className="promo-scan-corner promo-scan-bl" />
                  <span className="promo-scan-corner promo-scan-br" />
                  <span className="promo-scan-line" />
                </div>
              </div>
              <div className="promo-scanner-actions">
                <button
                  className="promo-scanner-action-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <MdImage /> Зургаас уншуулах
                </button>
                <button className="promo-scanner-action-btn promo-scanner-stop" onClick={stopCamera}>
                  Хаах
                </button>
              </div>
            </div>
          )}

          {/* Hidden div for file scanning */}
          <div id="promo-qr-file-scanner" style={{ display: "none" }} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />

          {/* Result */}
          {result && (
            <div className={`promo-result promo-result-${result.type}`}>
              {result.type === "success" ? (
                <MdCheckCircle className="promo-result-icon" />
              ) : (
                <MdError className="promo-result-icon" />
              )}
              <span>{result.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
