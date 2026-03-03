// ═══════════════════════════════════════════════════════════════
// PurchaseModal — Buy credits via QPay
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createQPayInvoice, checkQPayPayment } from "../services/creditService";
import {
  MdClose,
  MdAdd,
  MdRemove,
  MdCheckCircle,
  MdShoppingCart,
  MdPayment,
} from "react-icons/md";
import "./PurchaseModal.css";

const PRICE_PER_CREDIT = 5000;

// Known Mongolian bank apps for deeplinks
const BANK_ICONS = {
  "Khan bank": "🏦",
  "Golomt bank": "🏦",
  "TDB": "🏦",
  "Xac bank": "🏦",
  "State bank": "🏦",
  "M bank": "📱",
  "Bogd bank": "🏦",
  "Capitron bank": "🏦",
  "Chinggis khaan bank": "🏦",
  "Most money": "💰",
  "Pocket": "📱",
  "QPay wallet": "👛",
  "SocialPay": "💳",
  "MonPay": "💳",
  "Hi-Pay": "💳",
  "Ard App": "📱",
};

function getBankIcon(name) {
  for (const [key, icon] of Object.entries(BANK_ICONS)) {
    if (name?.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "🏦";
}

export default function PurchaseModal({ open, onClose, onSuccess }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState("select"); // "select" | "paying" | "success"
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBanks, setShowBanks] = useState(false);
  const pollRef = useRef(null);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      setStep("select");
      setInvoiceData(null);
      setError(null);
      setQuantity(1);
      setShowBanks(false);
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleCreateInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await createQPayInvoice(user.uid, quantity);
      setInvoiceData(data);
      setStep("paying");

      // Start polling for payment status
      pollRef.current = setInterval(async () => {
        try {
          const status = await checkQPayPayment(data.invoiceNo);
          if (status.status === "paid") {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setStep("success");
            onSuccess?.();
          }
        } catch {
          // Polling error — ignore, will retry
        }
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="purchase-overlay" onClick={handleClose}>
      <div className="purchase-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="purchase-header">
          <h2 className="purchase-title">
            {step === "success" ? "🎉 Амжилттай!" : "🎁 Эрх худалдаж авах"}
          </h2>
          <button className="purchase-close" onClick={handleClose}>
            <MdClose />
          </button>
        </div>

        {/* Step: Select quantity */}
        {step === "select" && (
          <div className="purchase-body">
            <div className="purchase-price-card">
              <div className="purchase-price-label">Нэг эрхийн үнэ</div>
              <div className="purchase-price-amount">
                ₮{PRICE_PER_CREDIT.toLocaleString()}
              </div>
            </div>

            <div className="purchase-quantity">
              <span className="purchase-qty-label">Тоо хэмжээ</span>
              <div className="purchase-qty-controls">
                <button
                  className="purchase-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <MdRemove />
                </button>
                <span className="purchase-qty-value">{quantity}</span>
                <button
                  className="purchase-qty-btn"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                >
                  <MdAdd />
                </button>
              </div>
            </div>

            <div className="purchase-total">
              <span>Нийт дүн</span>
              <span className="purchase-total-amount">
                ₮{(PRICE_PER_CREDIT * quantity).toLocaleString()}
              </span>
            </div>

            {error && <div className="purchase-error">{error}</div>}

            <button
              className="purchase-pay-btn"
              onClick={handleCreateInvoice}
              disabled={loading}
            >
              {loading ? (
                <span className="purchase-spinner" />
              ) : (
                <>
                  <MdPayment /> QPay-ээр төлөх
                </>
              )}
            </button>
          </div>
        )}

        {/* Step: Paying — show QR */}
        {step === "paying" && invoiceData && (
          <div className="purchase-body">
            <p className="purchase-scan-hint">
              QPay QR кодыг банкны аппаар уншуулна уу
            </p>

            {/* QPay QR Image */}
            <div className="purchase-qr-wrap">
              {invoiceData.qrImage ? (
                <img
                  src={`data:image/png;base64,${invoiceData.qrImage}`}
                  alt="QPay QR Code"
                  className="purchase-qr-img"
                />
              ) : (
                <div className="purchase-qr-placeholder">
                  QR код ачааллаж байна...
                </div>
              )}
            </div>

            <div className="purchase-amount-info">
              <span>Төлөх дүн:</span>
              <strong>₮{invoiceData.amount?.toLocaleString()}</strong>
            </div>

            {/* Bank deeplinks */}
            {invoiceData.urls && invoiceData.urls.length > 0 && (
              <>
                <button
                  className="purchase-banks-toggle"
                  onClick={() => setShowBanks(!showBanks)}
                >
                  {showBanks ? "Аппуудыг хаах ▲" : "Банкны апп нээх ▼"}
                </button>

                {showBanks && (
                  <div className="purchase-banks">
                    {invoiceData.urls.map((bank, i) => (
                      <a
                        key={i}
                        href={bank.link}
                        className="purchase-bank-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="purchase-bank-icon">
                          {getBankIcon(bank.name)}
                        </span>
                        <span className="purchase-bank-name">
                          {bank.description || bank.name}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Polling indicator */}
            <div className="purchase-waiting">
              <span className="purchase-spinner" />
              <span>Төлбөр хүлээж байна...</span>
            </div>

            <button
              className="purchase-cancel-btn"
              onClick={handleClose}
            >
              Болих
            </button>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="purchase-body purchase-success-body">
            <div className="purchase-success-icon">
              <MdCheckCircle />
            </div>
            <h3 className="purchase-success-title">Төлбөр амжилттай!</h3>
            <p className="purchase-success-text">
              {quantity} эрх таны данс руу нэмэгдлээ.
              <br />
              Одоо мэндчилгээ үүсгэж эхлээрэй!
            </p>
            <button className="purchase-done-btn" onClick={handleClose}>
              <MdShoppingCart /> Дуусгах
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
