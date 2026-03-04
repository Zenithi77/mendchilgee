// ═══════════════════════════════════════════════════════════════
// PurchaseModal — Buy credits via BYL
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createCreditCheckout } from "../services/creditService";
import {
  MdClose,
  MdAdd,
  MdRemove,
  MdPayment,
} from "react-icons/md";
import "./PurchaseModal.css";

const PRICE_PER_CREDIT = 5000;

export default function PurchaseModal({ open, onClose }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await createCreditCheckout(user.uid, quantity);

      // Redirect directly to BYL checkout page
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="purchase-overlay" onClick={handleClose}>
      <div className="purchase-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="purchase-header">
          <h2 className="purchase-title">
            🎁 Эрх худалдаж авах
          </h2>
          <button className="purchase-close" onClick={handleClose}>
            <MdClose />
          </button>
        </div>

        {/* Select quantity */}
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
      </div>
    </div>
  );
}
