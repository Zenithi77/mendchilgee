// ═══════════════════════════════════════════════════════════════
// AdminPromoPanel — Admin create/manage promo codes + QR
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { generateShapedQR, QR_SHAPES } from "../utils/heartQr";
import {
  MdAdd,
  MdDelete,
  MdContentCopy,
  MdQrCode2,
  MdClose,
  MdToggleOn,
  MdToggleOff,
  MdDownload,
  MdArrowBack,
} from "react-icons/md";
import "./AdminPromoPanel.css";

const SITE_URL =
  import.meta.env.VITE_SITE_URL || "https://www.mendchilgee.site";

export default function AdminPromoPanel({ onBack }) {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [qrModal, setQrModal] = useState(null); // { code, qrDataUrl, url }
  const [qrShape, setQrShape] = useState("heart");
  const [qrLoading, setQrLoading] = useState(false);

  // New promo form
  const [newCode, setNewCode] = useState("");
  const [newCredits, setNewCredits] = useState(1);
  const [newMaxUses, setNewMaxUses] = useState(100);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  // Subscribe to promoCodes collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "promoCodes"), (snap) => {
      const codes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      codes.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0),
      );
      setPromoCodes(codes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Generate random code
  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setNewCode(code);
  };

  // Create promo code
  const handleCreate = async () => {
    const code = newCode.trim().toUpperCase();
    if (!code) {
      setError("Промо код оруулна уу");
      return;
    }
    if (code.length < 3) {
      setError("Промо код хамгийн багадаа 3 тэмдэгт байх ёстой");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      await setDoc(doc(db, "promoCodes", code), {
        active: true,
        credits: newCredits,
        maxUses: newMaxUses,
        currentUses: 0,
        createdAt: serverTimestamp(),
      });

      setNewCode("");
      setNewCredits(1);
      setNewMaxUses(100);
      setShowCreate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Toggle active state
  const toggleActive = async (code, currentActive) => {
    try {
      await updateDoc(doc(db, "promoCodes", code), {
        active: !currentActive,
      });
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // Delete promo code
  const handleDelete = async (code) => {
    if (!window.confirm(`"${code}" промо кодыг устгах уу?`)) return;
    try {
      await deleteDoc(doc(db, "promoCodes", code));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Copy code to clipboard
  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  // Copy promo URL
  const copyUrl = async (code) => {
    const url = `${SITE_URL}/promo/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(`url_${code}`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  // Show QR modal
  const showQR = useCallback(async (code, shape) => {
    const url = `${SITE_URL}/promo/${code}`;
    const selectedShape = shape || qrShape;
    const shapeMeta = QR_SHAPES.find((s) => s.id === selectedShape) || QR_SHAPES[0];
    setQrLoading(true);
    try {
      const qrDataUrl = await generateShapedQR(url, {
        size: 600,
        color: shapeMeta.defaultColor,
        shape: selectedShape,
      });
      setQrModal({ code, qrDataUrl, url, shape: selectedShape });
    } catch (err) {
      console.error("QR generation error:", err);
    } finally {
      setQrLoading(false);
    }
  }, [qrShape]);

  // Regenerate QR when shape changes
  const handleShapeChange = useCallback(async (newShape) => {
    setQrShape(newShape);
    if (qrModal) {
      showQR(qrModal.code, newShape);
    }
  }, [qrModal, showQR]);

  // Download QR
  const downloadQR = () => {
    if (!qrModal) return;
    const link = document.createElement("a");
    link.download = `promo-${qrModal.code}.png`;
    link.href = qrModal.qrDataUrl;
    link.click();
  };

  return (
    <div className="admin-promo">
      {/* Header */}
      <div className="admin-promo-header">
        <button className="admin-back-btn" onClick={onBack}>
          <MdArrowBack /> Буцах
        </button>
        <h2 className="admin-promo-title">🎟️ Промо кодууд</h2>
        <button
          className="admin-create-btn"
          onClick={() => {
            setShowCreate(true);
            generateCode();
          }}
        >
          <MdAdd /> Шинэ код
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="admin-create-card">
          <div className="admin-create-header">
            <h3>Шинэ промо код үүсгэх</h3>
            <button
              className="admin-create-close"
              onClick={() => setShowCreate(false)}
            >
              <MdClose />
            </button>
          </div>

          <div className="admin-form-group">
            <label>Промо код</label>
            <div className="admin-code-input-wrap">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="PROMO2026"
                className="admin-input"
                maxLength={20}
              />
              <button className="admin-gen-btn" onClick={generateCode}>
                🎲 Үүсгэх
              </button>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Эрхийн тоо</label>
              <input
                type="number"
                value={newCredits}
                onChange={(e) =>
                  setNewCredits(Math.max(1, parseInt(e.target.value) || 1))
                }
                min={1}
                max={100}
                className="admin-input admin-input-sm"
              />
            </div>
            <div className="admin-form-group">
              <label>Хэрэглээний лимит</label>
              <input
                type="number"
                value={newMaxUses}
                onChange={(e) =>
                  setNewMaxUses(Math.max(1, parseInt(e.target.value) || 1))
                }
                min={1}
                max={100000}
                className="admin-input admin-input-sm"
              />
            </div>
          </div>

          {error && <div className="admin-error">{error}</div>}

          <button
            className="admin-submit-btn"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? "Үүсгэж байна..." : "Промо код үүсгэх"}
          </button>
        </div>
      )}

      {/* Promo codes list */}
      {loading ? (
        <div className="admin-loading">Ачааллаж байна...</div>
      ) : promoCodes.length === 0 ? (
        <div className="admin-empty">
          <span>🎫</span>
          <p>Промо код байхгүй байна</p>
          <p className="admin-empty-hint">
            Дээрх &quot;Шинэ код&quot; товч дарж үүсгэнэ үү
          </p>
        </div>
      ) : (
        <div className="admin-codes-list">
          {promoCodes.map((promo) => (
            <div
              key={promo.id}
              className={`admin-code-card ${!promo.active ? "admin-code-inactive" : ""}`}
            >
              <div className="admin-code-top">
                <span className="admin-code-text">{promo.id}</span>
                <div className="admin-code-badges">
                  <span className="admin-badge admin-badge-credit">
                    {promo.credits || 1} эрх
                  </span>
                  <span
                    className={`admin-badge ${promo.active ? "admin-badge-active" : "admin-badge-off"}`}
                  >
                    {promo.active ? "Идэвхтэй" : "Идэвхгүй"}
                  </span>
                </div>
              </div>

              <div className="admin-code-stats">
                <span>
                  Ашигласан: <strong>{promo.currentUses || 0}</strong> /{" "}
                  {promo.maxUses || "∞"}
                </span>
              </div>

              <div className="admin-code-actions">
                <button
                  className="admin-act-btn"
                  onClick={() => copyCode(promo.id)}
                  title="Код хуулах"
                >
                  <MdContentCopy />
                  {copied === promo.id ? "Хуулсан!" : "Код"}
                </button>
                <button
                  className="admin-act-btn"
                  onClick={() => copyUrl(promo.id)}
                  title="Линк хуулах"
                >
                  <MdContentCopy />
                  {copied === `url_${promo.id}` ? "Хуулсан!" : "Линк"}
                </button>
                <button
                  className="admin-act-btn admin-act-qr"
                  onClick={() => showQR(promo.id)}
                  title="QR код"
                >
                  <MdQrCode2 /> QR
                </button>
                <button
                  className="admin-act-btn"
                  onClick={() => toggleActive(promo.id, promo.active)}
                  title={promo.active ? "Идэвхгүй болгох" : "Идэвхтэй болгох"}
                >
                  {promo.active ? <MdToggleOn /> : <MdToggleOff />}
                </button>
                <button
                  className="admin-act-btn admin-act-del"
                  onClick={() => handleDelete(promo.id)}
                  title="Устгах"
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="admin-qr-overlay" onClick={() => setQrModal(null)}>
          <div
            className="admin-qr-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-qr-header">
              <h3>QR код — {qrModal.code}</h3>
              <button
                className="admin-qr-close"
                onClick={() => setQrModal(null)}
              >
                <MdClose />
              </button>
            </div>
            <div className="admin-qr-body">
              {/* Shape selector */}
              <div className="admin-qr-shapes">
                {QR_SHAPES.map((s) => (
                  <button
                    key={s.id}
                    className={`admin-qr-shape-btn ${
                      qrShape === s.id ? "admin-qr-shape-active" : ""
                    }`}
                    onClick={() => handleShapeChange(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {qrLoading ? (
                <div className="admin-qr-loading">
                  <span className="purchase-spinner" />
                  <span>QR үүсгэж байна...</span>
                </div>
              ) : (
                <img
                  src={qrModal.qrDataUrl}
                  alt={`QR - ${qrModal.code}`}
                  className="admin-qr-img"
                />
              )}
              <p className="admin-qr-url">{qrModal.url}</p>
              <div className="admin-qr-actions">
                <button className="admin-qr-dl-btn" onClick={downloadQR}>
                  <MdDownload /> Татах
                </button>
                <button
                  className="admin-qr-copy-btn"
                  onClick={() => copyUrl(qrModal.code)}
                >
                  <MdContentCopy />{" "}
                  {copied === `url_${qrModal.code}` ? "Хуулсан!" : "Линк хуулах"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
