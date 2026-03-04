import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGift } from "../services/giftService";
import { getGiftResponse } from "../services/giftResponseService";
import { giftToTemplate } from "../models/gift";
import FinalSummary2 from "./FinalSummary2";
import { MdSentimentDissatisfied, MdMailOutline, MdArrowBack, MdQuestionAnswer } from "react-icons/md";
import "./GiftPreviewPage.css";
import "./GiftResponsesPage.css";

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

  // Extract simpleQuestions answers from choices
  const sqSections = useMemo(() => {
    if (!response?.choices || !gift?.sections) return [];
    const result = [];
    Object.keys(response.choices).forEach((key) => {
      if (key.startsWith("simpleQuestions_")) {
        const idx = parseInt(key.split("_")[1], 10);
        const section = gift.sections[idx];
        const title = section?.data?.title || "Асуулт хариулт";
        const pairs = response.choices[key];
        if (Array.isArray(pairs) && pairs.length > 0) {
          result.push({ key, idx, title, pairs });
        }
      }
    });
    return result;
  }, [response, gift]);

  // Check if there are non-simpleQuestions choices (for FinalSummary2)
  const hasOtherChoices = useMemo(() => {
    if (!response?.choices) return false;
    return Object.keys(response.choices).some(
      (k) => !k.startsWith("simpleQuestions_"),
    );
  }, [response]);

  if (loading) {
    return (
      <div className="gift-preview-page gift-preview-loading">
        <div className="loader-ring" />
        <span className="loader-text">Хариу ачаалж байна</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gift-preview-page gift-preview-error">
        <div className="gift-preview-error-icon"><MdSentimentDissatisfied /></div>
        <h2>Алдаа гарлаа</h2>
        <p>{error}</p>
        <button className="gift-preview-back-btn" onClick={() => navigate(-1)}>
          ← Буцах
        </button>
      </div>
    );
  }

  if (!response?.choices || (sqSections.length === 0 && !hasOtherChoices)) {
    return (
      <div className="gift-preview-page gift-preview-error">
        <div className="gift-preview-error-icon"><MdMailOutline /></div>
        <h2>Хариу алга байна</h2>
        <p>Энэ мэндчилгээнд одоогоор хариу ирээгүй байна.</p>
        <button className="gift-preview-back-btn" onClick={() => navigate(-1)}>
          ← Буцах
        </button>
      </div>
    );
  }

  const template = giftToTemplate(gift);

  return (
    <div className="grp-page">
      {/* Back button */}
      <button className="grp-back" onClick={() => navigate(-1)}>
        <MdArrowBack /> Буцах
      </button>

      {/* SimpleQuestions answers */}
      {sqSections.map((sq) => (
        <div key={sq.key} className="grp-section">
          <div className="grp-section-header">
            <MdQuestionAnswer className="grp-section-icon" />
            <h2 className="grp-section-title">{sq.title}</h2>
          </div>
          <div className="grp-qa-list">
            {sq.pairs.map((pair, i) => (
              <div key={i} className="grp-qa-card">
                <div className="grp-qa-num">{i + 1}</div>
                <div className="grp-qa-content">
                  <p className="grp-qa-question">{pair.question}</p>
                  <p className="grp-qa-answer">
                    {pair.answer || <span className="grp-qa-empty">Хариулаагүй</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Other choices (FinalSummary2) */}
      {hasOtherChoices && (
        <div className={`gift-preview-page app ${gift.theme?.className || ""}`}>
          <FinalSummary2 choices={response.choices || {}} template={template} />
        </div>
      )}
    </div>
  );
}
