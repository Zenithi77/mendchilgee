// ═══════════════════════════════════════════════════════════════
// PurchaseModal — Plan-based purchase with extras via BYL
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createPlanCheckout } from "../services/planService";
import { PLAN_IDS, calcTotalPrice } from "../config/plans";
import PlanSelector from "./PlanSelector";
import {
  MdClose,
  MdPayment,
} from "react-icons/md";
import "./PurchaseModal.css";

export default function PurchaseModal({ open, onClose }) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(PLAN_IDS.BASIC);
  const [extraImages, setExtraImages] = useState(0);
  const [extraVideoSeconds, setExtraVideoSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pricing = useMemo(
    () => calcTotalPrice(selectedPlan, extraImages, extraVideoSeconds),
    [selectedPlan, extraImages, extraVideoSeconds],
  );

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await createPlanCheckout(user.uid, {
        planId: selectedPlan,
        extraImages,
        extraVideoSeconds,
        totalAmount: pricing.total,
      });

      // Redirect to BYL checkout page
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setError(null);
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="purchase-overlay" onClick={handleClose}>
      <div className="purchase-modal purchase-modal-plans" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="purchase-header">
          <h2 className="purchase-title">
            🎁 Багц худалдаж авах
          </h2>
          <button className="purchase-close" onClick={handleClose}>
            <MdClose />
          </button>
        </div>

        {/* Plan Selection + Extras */}
        <div className="purchase-body">
          <PlanSelector
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            extraImages={extraImages}
            onExtraImagesChange={setExtraImages}
            extraVideoSeconds={extraVideoSeconds}
            onExtraVideoChange={setExtraVideoSeconds}
          />

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
                <MdPayment /> ₮{pricing.total.toLocaleString()} төлөх
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
