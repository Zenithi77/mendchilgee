// ═══════════════════════════════════════════════════════════════
// PromoCodeModal — Enter promo code by text or scan QR
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { redeemPromoCode } from "../services/creditService";
import {
  MdClose,
  MdQrCodeScanner,
  MdKeyboard,
  MdCameraAlt,
  MdImage,
  MdCheckCircle,
  MdError,
} from "react-icons/md";
import "./PromoCodeModal.css";

export default function PromoCodeModal({ open, onClose, onSuccess }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("code"); // "code" | "qr"
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: "success"|"error", message }
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

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
    setCameraActive(false);
  }, []);

  // Cleanup camera on unmount or close
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setResult(null);
      setCode("");
      setTab("code");
      setCameraActive(false);
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
      setResult({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleQRResult = useCallback(
    async (decodedText) => {
      if (loading) return;

      // Extract promo code from URL or use raw text
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
        setResult({ type: "error", message: err.message });
      } finally {
        setLoading(false);
      }
    },
    [user, loading, onSuccess, stopCamera],
  );

  const startCamera = async () => {
    setResult(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scannerId = "promo-qr-scanner";

      // Ensure previous scanner is cleaned up
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch { /* noop */ }
      }

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleQRResult(decodedText);
        },
        () => {
          // QR not found in frame — ignore
        },
      );

      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      setResult({
        type: "error",
        message: "Камер нээхэд алдаа гарлаа. Камерын зөвшөөрөл өгнө үү.",
      });
    }
  };

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
          <button className="promo-close" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        {/* Tabs */}
        <div className="promo-tabs">
          <button
            className={`promo-tab ${tab === "code" ? "active" : ""}`}
            onClick={() => {
              setTab("code");
              stopCamera();
              setResult(null);
            }}
          >
            <MdKeyboard /> Код оруулах
          </button>
          <button
            className={`promo-tab ${tab === "qr" ? "active" : ""}`}
            onClick={() => {
              setTab("qr");
              setResult(null);
            }}
          >
            <MdQrCodeScanner /> QR уншуулах
          </button>
        </div>

        {/* Content */}
        <div className="promo-content">
          {/* Code Tab */}
          {tab === "code" && (
            <div className="promo-code-tab">
              <p className="promo-hint">Промо кодоо оруулна уу</p>
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
                  {loading ? (
                    <span className="promo-spinner" />
                  ) : (
                    "Ашиглах"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* QR Tab */}
          {tab === "qr" && (
            <div className="promo-qr-tab">
              <p className="promo-hint">
                QR кодоо камераар уншуулах эсвэл зургаас уншуулна уу
              </p>

              {/* Camera scanner area */}
              <div
                className="promo-scanner-area"
                style={{ display: cameraActive ? "block" : "none" }}
              >
                <div id="promo-qr-scanner" />
              </div>

              {/* Hidden div for file scanning */}
              <div id="promo-qr-file-scanner" style={{ display: "none" }} />

              {/* Camera action buttons */}
              {!cameraActive && !loading && (
                <div className="promo-qr-actions">
                  <button
                    className="promo-qr-btn promo-qr-camera"
                    onClick={startCamera}
                  >
                    <MdCameraAlt />
                    <span>Камер нээх</span>
                  </button>
                  <button
                    className="promo-qr-btn promo-qr-upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <MdImage />
                    <span>Зураг сонгох</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                </div>
              )}

              {/* Stop camera button */}
              {cameraActive && (
                <button className="promo-stop-camera" onClick={stopCamera}>
                  Камер хаах
                </button>
              )}

              {loading && !cameraActive && (
                <div className="promo-loading">
                  <span className="promo-spinner" />
                  <span>Уншиж байна...</span>
                </div>
              )}
            </div>
          )}

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
