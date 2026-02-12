import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGift } from "../services/giftService";
import GiftRenderer from "./GiftRenderer";
import "./GiftPreviewPage.css";

/**
 * GiftPreviewPage — standalone page that loads a gift from Firestore
 * by its document ID and renders it full-screen via GiftRenderer.
 *
 * Route: /preview/:giftId
 */
export default function GiftPreviewPage() {
  const { giftId } = useParams();
  const navigate = useNavigate();
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getGift(giftId);
        if (cancelled) return;
        if (!data) {
          setError("Gift олдсонгүй");
        } else {
          setGift(data);

          // Apply theme CSS variables
          if (data.theme?.colors) {
            const root = document.documentElement;
            Object.entries(data.theme.colors).forEach(([key, val]) => {
              root.style.setProperty(key, val);
            });
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      // Clean up theme vars
      const root = document.documentElement;
      [
        "--t-primary",
        "--t-secondary",
        "--t-accent",
        "--t-accent2",
        "--t-soft",
        "--t-light",
        "--t-bg",
        "--t-bg2",
        "--t-glass",
        "--t-glass-border",
      ].forEach((k) => root.style.removeProperty(k));
    };
  }, [giftId]);

  if (loading) {
    return (
      <div className="gift-preview-page gift-preview-loading">
        <div className="gift-preview-spinner">💝</div>
        <p>Ачаалж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gift-preview-page gift-preview-error">
        <div className="gift-preview-error-icon">😢</div>
        <h2>Алдаа гарлаа</h2>
        <p>{error}</p>
        <button className="gift-preview-back-btn" onClick={() => navigate(-1)}>
          ← Буцах
        </button>
      </div>
    );
  }

  // Determine startDate from welcome section
  const welcomeSec = gift.sections?.find((s) => s.type === "welcome");
  const startDate = welcomeSec?.data?.startDate
    ? new Date(welcomeSec.data.startDate)
    : new Date();

  // Determine initial section index from URL hash (e.g. #section-<id>)
  let initialIndex = 0;
  try {
    const hash = window.location.hash || "";
    if (hash.startsWith("#section-")) {
      const id = hash.replace("#section-", "");
      const idx = gift.sections?.findIndex((s) => String(s.id) === String(id));
      if (typeof idx === "number" && idx >= 0) initialIndex = idx;
    }
  } catch (e) {
    initialIndex = 0;
  }

  return (
    <div className={`gift-preview-page app ${gift.theme?.className || ""}`}>

      <GiftRenderer
        gift={gift}
        startDate={startDate}
        category={gift.category}
        initialSectionIndex={initialIndex}
      />
    </div>
  );
}
