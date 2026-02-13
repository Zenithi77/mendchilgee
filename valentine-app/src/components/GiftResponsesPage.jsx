import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGift } from "../services/giftService";
import { getGiftResponse } from "../services/giftResponseService";
import { giftToTemplate } from "../models/gift";
import FinalSummary2 from "./FinalSummary2";
import "./GiftPreviewPage.css";

export default function GiftResponsesPage() {
  const { giftId } = useParams();
  const navigate = useNavigate();
  const [gift, setGift] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [giftData, responseData] = await Promise.all([
          getGift(giftId),
          getGiftResponse(giftId),
        ]);

        if (cancelled) return;

        if (!giftData) {
          setError("Gift олдсонгүй");
          return;
        }

        setGift(giftData);
        setResponse(responseData);

        // Apply theme CSS variables
        if (giftData.theme?.colors) {
          const root = document.documentElement;
          Object.entries(giftData.theme.colors).forEach(([key, val]) => {
            root.style.setProperty(key, val);
          });
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
        <div className="gift-preview-spinner">💌</div>
        <p>Хариу ачаалж байна...</p>
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

  if (!response?.choices) {
    return (
      <div className="gift-preview-page gift-preview-error">
        <div className="gift-preview-error-icon">📭</div>
        <h2>Хариу алга байна</h2>
        <p>Энэ бэлэгт одоогоор хариу ирээгүй байна.</p>
        <button className="gift-preview-back-btn" onClick={() => navigate(-1)}>
          ← Буцах
        </button>
      </div>
    );
  }

  const template = giftToTemplate(gift);

  return (
    <div className={`gift-preview-page app ${gift.theme?.className || ""}`}> 
      <FinalSummary2 choices={response.choices || {}} template={template} />
    </div>
  );
}
