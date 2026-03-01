import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getUserGifts, deleteGift } from "../services/giftService";
import { generateHeartQR } from "../utils/heartQr";
import { shouldShowWatermark, getRequiredTier } from "../utils/tierUtils";
import { TIER_META } from "../config/tiers";
import { MdMail, MdChecklist, MdPhotoCamera, MdLock, MdEdit, MdVisibility, MdSend, MdDelete, MdClose, MdAutoAwesome, MdCelebration, MdAdd, MdFavorite, MdWaterDrop } from "react-icons/md";
import "./GiftListPage.css";

export default function GiftListPage({ onCreateNew, onEditGift }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [sharePanel, setSharePanel] = useState(null);

  const fetchGifts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await getUserGifts(user.uid);
      // Sort by updatedAt descending
      result.sort((a, b) => {
        const ta = a.updatedAt?.toDate?.() || new Date(0);
        const tb = b.updatedAt?.toDate?.() || new Date(0);
        return tb - ta;
      });
      setGifts(result);
    } catch (err) {
      console.error("Failed to load gifts:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  const handleDelete = async (giftId) => {
    setDeletingId(giftId);
    try {
      await deleteGift(giftId);
      setGifts((prev) => prev.filter((g) => g.id !== giftId));
    } catch (err) {
      console.error("Failed to delete gift:", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handlePreview = (giftId) => {
    navigate(`/${giftId}`);
  };

  const openSharePanel = useCallback(
    async (gift) => {
      if (!gift?.id) return;

      if (sharePanel?.id === gift.id) {
        setSharePanel(null);
        return;
      }

      const url = `${window.location.origin}/${gift.id}`;
      const title = getGiftTitle(gift);
      setSharePanel({
        id: gift.id,
        title,
        url,
        qr: null,
        loading: true,
        error: null,
      });

      // Best-effort: also copy the URL
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // ignore
      }

      try {
        const qr = await generateHeartQR(url, { size: 700, color: "#e60023" });
        setSharePanel((prev) =>
          prev?.id === gift.id ? { ...prev, qr, loading: false } : prev,
        );
      } catch (err) {
        console.error("Heart QR generation failed:", err);
        setSharePanel((prev) =>
          prev?.id === gift.id
            ? { ...prev, loading: false, error: "QR үүсгэхэд алдаа гарлаа" }
            : prev,
        );
      }
    },
    [sharePanel?.id],
  );

  /** Extract summary pills (step-question choices stored in finalSummary fields) */
  const getGiftSummary = (gift) => {
    const pills = [];
    // Try to pull stepQuestions options chosen at build time
    const stepSec = gift.sections?.find((s) => s.type === "stepQuestions");
    const finalSec = gift.sections?.find((s) => s.type === "finalSummary");
    const fields = finalSec?.data?.summaryFields || [];

    // If the builder persisted choices inside the gift, use them
    const choices = gift.choices || {};
    for (const f of fields) {
      const val = choices[f.key];
      if (val) {
        const display = Array.isArray(val) ? val.join(", ") : val;
        pills.push({ emoji: f.emoji, label: f.label, value: display });
      }
    }

    // Fallback: show info from sections
    if (pills.length === 0) {
      const letterSec = gift.sections?.find((s) => s.type === "loveLetter");
      if (letterSec?.data?.title) {
        pills.push({
          emoji: <MdMail />,
          label: "Захидал",
          value: letterSec.data.title,
        });
      }
      if (stepSec?.data?.steps?.length) {
        pills.push({
          emoji: <MdChecklist />,
          label: "Алхамууд",
          value: `${stepSec.data.steps.length} алхам`,
        });
      }
      const gallerySec = gift.sections?.find((s) => s.type === "memoryGallery");
      if (gallerySec?.data?.memories?.length) {
        const withImg = gallerySec.data.memories.filter((m) => m.src).length;
        if (withImg > 0)
          pills.push({
            emoji: <MdPhotoCamera />,
            label: "Зураг",
            value: `${withImg} зураг`,
          });
      }
    }

    // Password status
    if (gift.password) {
      pills.push({ emoji: <MdLock />, label: "Нууц үг", value: "тохируулсан" });
    }

    return pills;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGiftTitle = (gift) => {
    // Try to extract a title from welcome section
    const welcomeSec = gift.sections?.find((s) => s.type === "welcome");
    if (welcomeSec?.data?.title) return welcomeSec.data.title;
    if (welcomeSec?.data?.partnerName)
      return `Gift for ${welcomeSec.data.partnerName}`;
    return "Untitled Gift";
  };

  const getGiftEmoji = (gift) => {
    const category = gift.category;
    const emojiMap = {
      march8: "🌷",
      "soldiers-day": "🎖️",
      birthday: "🎂",
      valentine: "💕",
      general: "🎊",
    };
    return emojiMap[category] || "🎁";
  };

  const getSectionCount = (gift) => {
    return gift.sections?.length || 0;
  };

  if (loading) {
    return (
      <div className="gift-list-page">
        <div className="gift-list-loading">
          <div className="loader-ring" />
          <span className="loader-text">Ачаалж байна</span>
        </div>
      </div>
    );
  }

  return (
    <div className="gift-list-page">
      <div className="gift-list-container">
        {/* Header */}
        <div className="gift-list-header">
          <div className="gift-list-header-emoji"><MdCelebration /></div>
          <h1 className="gift-list-title font-script">Миний мэндчилгээнүүд</h1>
          <p className="gift-list-subtitle">
            {gifts.length === 0
              ? <>Та одоогоор мэндчилгээ үүсгээгүй байна. Шинээр үүсгэе! <MdAutoAwesome /></>
              : `Танд нийт ${gifts.length} мэндчилгээ байна`}
          </p>
        </div>

        {/* Create New Button */}
        <div className="gift-list-actions">
          <button className="btn btn-create-gift" onClick={onCreateNew}>
            <span className="btn-create-icon"><MdAutoAwesome /></span>
            Шинэ мэндчилгээ үүсгэх
          </button>
        </div>

        {/* Gift Cards */}
        {gifts.length > 0 && (
          <div className="gift-list-grid">
            {gifts.map((gift) => (
              <div key={gift.id} className="gift-card">
                <div className="gift-card-header">
                  <span className="gift-card-emoji">{getGiftEmoji(gift)}</span>
                  <div className="gift-card-info">
                    <h3 className="gift-card-title">{getGiftTitle(gift)}</h3>
                    <span className="gift-card-date">
                      {formatDate(gift.updatedAt || gift.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="gift-card-meta">
                  <span className="gift-card-badge">
                    {getSectionCount(gift)} section
                    {getSectionCount(gift) !== 1 ? "s" : ""}
                  </span>
                  {gift.category && (
                    <span className="gift-card-badge gift-card-badge-cat">
                      {gift.category}
                    </span>
                  )}
                  {(() => {
                    const tier = getRequiredTier(gift.sections);
                    const meta = TIER_META[tier];
                    return (
                      <span
                        className="gift-card-badge gift-card-badge-tier"
                        style={{ borderColor: meta.color, color: meta.color }}
                      >
                        {meta.badge} {meta.label}
                      </span>
                    );
                  })()}
                  {shouldShowWatermark(gift) && (
                    <span className="gift-card-badge gift-card-badge-watermark">
                      <MdWaterDrop /> Watermark
                    </span>
                  )}
                </div>

                {/* Summary pills */}
                {(() => {
                  const pills = getGiftSummary(gift);
                  return pills.length > 0 ? (
                    <div className="gift-card-summary">
                      {pills.map((p, i) => (
                        <span key={i} className="gift-card-summary-pill">
                          {p.emoji} {p.label}: {p.value}
                        </span>
                      ))}
                    </div>
                  ) : null;
                })()}

                <div className="gift-card-actions">
                  <button
                    className="gift-action-btn gift-action-edit"
                    onClick={() => onEditGift(gift)}
                  >
                    <MdEdit /> Edit
                  </button>
                  <button
                    className="gift-action-btn gift-action-preview"
                    onClick={() => handlePreview(gift.id)}
                  >
                    <MdVisibility /> Preview
                  </button>
                  <button
                    className="gift-action-btn gift-action-responses"
                    onClick={() => navigate(`/responses/${gift.id}`)}
                  >
                    <MdSend /> Responses
                  </button>
                  <button
                    className="gift-action-btn gift-action-share"
                    data-copy={gift.id}
                    onClick={() => openSharePanel(gift)}
                  >
                    Copy Link
                  </button>
                  {confirmDeleteId === gift.id ? (
                    <div className="gift-delete-confirm">
                      <span>Устгах уу?</span>
                      <button
                        className="gift-action-btn gift-action-delete-yes"
                        onClick={() => handleDelete(gift.id)}
                        disabled={deletingId === gift.id}
                      >
                        {deletingId === gift.id ? "..." : "Тийм"}
                      </button>
                      <button
                        className="gift-action-btn gift-action-delete-no"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Үгүй
                      </button>
                    </div>
                  ) : (
                    <button
                      className="gift-action-btn gift-action-delete"
                      onClick={() => setConfirmDeleteId(gift.id)}
                    >
                      <MdDelete />
                    </button>
                  )}
                </div>

                {sharePanel?.id === gift.id && (
                  <div className="gift-share-panel">
                    <div className="gift-share-panel-header">
                      <div className="gift-share-panel-title">
                        {sharePanel.title}
                      </div>
                      <button
                        type="button"
                        className="gift-share-panel-close"
                        onClick={() => setSharePanel(null)}
                        aria-label="Close"
                        title="Close"
                      >
                        <MdClose />
                      </button>
                    </div>

                    <div className="gift-share-panel-qr">
                      {sharePanel.loading ? (
                        <div className="gift-share-panel-loading">
                          <span><MdFavorite /></span>
                          <p>QR үүсгэж байна...</p>
                        </div>
                      ) : sharePanel.qr ? (
                        <img
                          className="gift-share-panel-qr-img"
                          src={sharePanel.qr}
                          alt="Heart QR"
                        />
                      ) : (
                        <div className="gift-share-panel-error">
                          {sharePanel.error}
                        </div>
                      )}
                    </div>

                    <div className="gift-share-panel-url">
                      <div className="gift-share-panel-url-label">URL</div>
                      <input
                        className="gift-share-panel-url-input"
                        value={sharePanel.url}
                        readOnly
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {gifts.length === 0 && (
          <div className="gift-list-empty">
            <div className="gift-list-empty-icon"><MdMail /></div>
            <p className="gift-list-empty-text">
              Онцгой мэндчилгээ үүсгээд хайртай хүмүүстээ линкээр
              илгээгээрэй!
            </p>
            <button className="btn btn-create-gift" onClick={onCreateNew}>
              <span className="btn-create-icon"><MdAutoAwesome /></span>
              Эхлүүлэх
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
