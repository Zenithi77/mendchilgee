// ═══════════════════════════════════════════════════════════════
// PurchaseModal — Buy credits via BYL
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createCreditCheckout, checkCreditPayment } from "../services/creditService";
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

export default function PurchaseModal({ open, onClose, onSuccess }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState("select"); // "select" | "waiting" | "success"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientRef, setClientRef] = useState(null);
  const pollRef = useRef(null);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      setStep("select");
      setError(null);
      setQuantity(1);
      setClientRef(null);
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await createCreditCheckout(user.uid, quantity);
      setClientRef(data.client_reference_id);

      // Open BYL checkout in new tab
      window.open(data.checkoutUrl, "_blank");

      // Switch to waiting state and poll for payment completion
      setStep("waiting");

      pollRef.current = setInterval(async () => {
        try {
          const status = await checkCreditPayment(data.client_reference_id);
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
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? (
                <span className="purchase-spinner" />
              ) : (
                <>
                  <MdPayment /> Төлбөр төлөх
                </>
              )}
            </button>
          </div>
        )}

        {/* Step: Waiting for payment */}
        {step === "waiting" && (
          <div className="purchase-body">
            <div className="purchase-waiting-card">
              <div className="purchase-waiting-icon">
                <MdPayment />
              </div>
              <h3 className="purchase-waiting-title">Төлбөр хүлээж байна</h3>
              <p className="purchase-waiting-text">
                Төлбөрийн хуудас нээгдсэн байна.
                <br />
                Төлбөрөө хийсний дараа энэ хуудас автоматаар шинэчлэгдэнэ.
              </p>
              <div className="purchase-waiting-spinner">
                <span className="purchase-spinner" />
                <span>Төлбөр баталгаажихыг хүлээж байна...</span>
              </div>
            </div>

            <button className="purchase-cancel-btn" onClick={handleClose}>
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
