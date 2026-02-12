import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getUserGifts, deleteGift } from "../services/giftService";
import "./GiftListPage.css";
import Logo from "../assets/Logo";

export default function GiftListPage({ onCreateNew, onEditGift }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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
    navigate(`/preview/${giftId}`);
  };

  const copyShareLink = (giftId) => {
    const url = `${window.location.origin}/preview/${giftId}`;
    navigator.clipboard.writeText(url).then(() => {
      // Brief visual feedback via a temp class
      const btn = document.querySelector(`[data-copy="${giftId}"]`);
      if (btn) {
        btn.textContent = "✓ Copied!";
        setTimeout(() => {
          btn.textContent = "🔗 Share";
        }, 1500);
      }
    });
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
      crush: "💘",
      "new-couple": "💕",
      "long-term": "💖",
      y2k: "🌸",
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
          <div className="gift-list-loading-icon">💝</div>
          <p>Loading your gifts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gift-list-page">
      <div className="gift-list-container">
        {/* Header */}
        <div className="gift-list-header">
          <div className="gift-list-header-emoji"><Logo /></div>
          <h1 className="gift-list-title font-script">My Gifts</h1>
          <p className="gift-list-subtitle">
            {gifts.length === 0
              ? "Одоохондоо бэлэг алга байна. Нэгийг нь хамтдаа бүтээх үү? 💝"
              : `Танд нийт ${gifts.length} бэлэг байна 💌`}
          </p>
        </div>

        {/* Create New Button */}
        <div className="gift-list-actions">
          <button className="btn btn-create-gift" onClick={onCreateNew}>
            <span className="btn-create-icon">✨</span>
            Create New Gift
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
                </div>

                <div className="gift-card-actions">
                  <button
                    className="gift-action-btn gift-action-edit"
                    onClick={() => onEditGift(gift)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="gift-action-btn gift-action-preview"
                    onClick={() => handlePreview(gift.id)}
                  >
                    👁️ Preview
                  </button>
                  <button
                    className="gift-action-btn gift-action-share"
                    data-copy={gift.id}
                    onClick={() => copyShareLink(gift.id)}
                  >
                    🔗 Share
                  </button>
                  {confirmDeleteId === gift.id ? (
                    <div className="gift-delete-confirm">
                      <span>Delete?</span>
                      <button
                        className="gift-action-btn gift-action-delete-yes"
                        onClick={() => handleDelete(gift.id)}
                        disabled={deletingId === gift.id}
                      >
                        {deletingId === gift.id ? "..." : "Yes"}
                      </button>
                      <button
                        className="gift-action-btn gift-action-delete-no"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      className="gift-action-btn gift-action-delete"
                      onClick={() => setConfirmDeleteId(gift.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {gifts.length === 0 && (
          <div className="gift-list-empty">
            <p className="gift-list-empty-text">
              Анхны Валентины бэлгээ урлаад, зүрхэндээ дотно хүндээ хуваалцаарай.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
