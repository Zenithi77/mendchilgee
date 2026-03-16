import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getUserGifts, deleteGift } from "../services/giftService";
import { generateShapedQR } from "../utils/heartQr";
import { MdMail, MdEdit, MdVisibility, MdSend, MdDelete, MdClose, MdAutoAwesome, MdFavorite, MdDownload, MdPrint, MdLock } from "react-icons/md";
import "./GiftListPage.css";

export default function GiftListPage({ onCreateNew, onEditGift }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [sharePanel, setSharePanel] = useState(null);
  const [shareShape, setShareShape] = useState("heart");
  const [shareColor, setShareColor] = useState("#e60023");
  const [unpaidPromptId, setUnpaidPromptId] = useState(null);

  const QR_COLORS = [
    { color: "#e60023", label: "Улаан" },
    { color: "#d63384", label: "Ягаан" },
    { color: "#9b59b6", label: "Нил ягаан" },
    { color: "#2563eb", label: "Цэнхэр" },
    { color: "#059669", label: "Ногоон" },
    { color: "#d97706", label: "Шар" },
    { color: "#1a0e12", label: "Хар" },
    { color: "#6b8f9e", label: "Саарал" },
  ];

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

  /** Check if a gift is activated (paid or credit used) */
  const isGiftActivated = (gift) => {
    return gift.status === "published" || gift.creditUsed === true;
  };

  const openSharePanel = useCallback(
    async (gift) => {
      if (!gift?.id) return;

      // Block sharing for unpaid/draft gifts
      if (!isGiftActivated(gift)) {
        setUnpaidPromptId((prev) => (prev === gift.id ? null : gift.id));
        setSharePanel(null);
        return;
      }

      setUnpaidPromptId(null);

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
        const qr = await generateShapedQR(url, { size: 400, color: shareColor, shape: shareShape });
        setSharePanel((prev) =>
          prev?.id === gift.id ? { ...prev, qr, loading: false } : prev,
        );
      } catch (err) {
        console.error("QR generation failed:", err);
        setSharePanel((prev) =>
          prev?.id === gift.id
            ? { ...prev, loading: false, error: "QR үүсгэхэд алдаа гарлаа" }
            : prev,
        );
      }
    },
    [sharePanel?.id, shareShape],
  );

  // Regenerate QR when shape changes
  useEffect(() => {
    if (!sharePanel?.id || !sharePanel?.url) return;
    let cancelled = false;
    setSharePanel((prev) => prev ? { ...prev, loading: true, qr: null } : prev);
    generateShapedQR(sharePanel.url, { size: 400, color: shareColor, shape: shareShape })
      .then((qr) => { if (!cancelled) setSharePanel((prev) => prev ? { ...prev, qr, loading: false } : prev); })
      .catch(() => { if (!cancelled) setSharePanel((prev) => prev ? { ...prev, loading: false, error: "QR алдаа" } : prev); });
    return () => { cancelled = true; };
  }, [shareShape, shareColor]);

  const handleShareDownload = () => {
    if (!sharePanel?.qr) return;
    const a = document.createElement("a");
    a.href = sharePanel.qr;
    a.download = `mendchilgee-qr-${shareShape}.png`;
    a.click();
  };

  const handleSharePrint = () => {
    if (!sharePanel?.qr) return;
    const w = window.open("", "_blank", "width=500,height=600");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>QR</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Georgia,serif;color:#333;text-align:center;padding:24px}
img{max-width:320px;max-height:320px;margin-bottom:16px}
h3{font-size:1.1rem;margin-bottom:6px}
p{font-size:0.82rem;color:#888;word-break:break-all}
@media print{body{padding:0}img{max-width:280px}}</style></head>
<body><img src="${sharePanel.qr}" alt="QR"/><h3>${sharePanel.title || "Мэндчилгээ"}</h3><p>${sharePanel.url}</p>
<script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script></body></html>`);
    w.document.close();
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

                {/* Unpaid banner */}
                {!isGiftActivated(gift) && (
                  <div className="gift-card-unpaid-banner">
                    <MdLock className="gift-card-unpaid-banner-icon" />
                    <span>Идэвхжүүлэгдээгүй — Хуваалцахын тулд эрх худалдаж аваад Export хийнэ үү</span>
                  </div>
                )}

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
                    className={`gift-action-btn gift-action-share ${!isGiftActivated(gift) ? 'gift-action-locked' : ''}`}
                    data-copy={gift.id}
                    onClick={() => openSharePanel(gift)}
                  >
                    {isGiftActivated(gift) ? 'Copy Link' : <><MdLock /> Copy Link</>}
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

                {/* Unpaid prompt panel */}
                {unpaidPromptId === gift.id && (
                  <div className="gift-unpaid-panel">
                    <div className="gift-unpaid-panel-header">
                      <div className="gift-unpaid-icon"><MdLock /></div>
                      <button
                        type="button"
                        className="gift-share-panel-close"
                        onClick={() => setUnpaidPromptId(null)}
                        aria-label="Close"
                      >
                        <MdClose />
                      </button>
                    </div>
                    <h4 className="gift-unpaid-title">Мэндчилгээ идэвхжүүлэгдээгүй</h4>
                    <p className="gift-unpaid-text">
                      Мэндчилгээг хуваалцахын тулд төлбөр төлөөд идэвхжүүлэх шаардлагатай.
                    </p>
                    <div className="gift-unpaid-actions">
                      <button
                        className="gift-unpaid-export-btn"
                        onClick={() => navigate(`/builder/${gift.id}?upgrade=true`)}
                      >
                        <MdAutoAwesome /> Төлбөр төлж идэвхжүүлэх
                      </button>
                    </div>
                  </div>
                )}

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

                    {/* Shape selector */}
                    <div className="gift-share-shapes">
                      {[
                        { key: "square",  icon: "▢", label: "Дөрвөлжин" },
                        { key: "heart",   icon: "♥", label: "Зүрх" },
                        { key: "star",    icon: "★", label: "Од" },
                        { key: "flower",  icon: "🌹", label: "Сарнай" },
                      ].map((s) => (
                        <button
                          key={s.key}
                          className={`gift-share-shape-btn ${shareShape === s.key ? "gift-share-shape-active" : ""}`}
                          onClick={() => setShareShape(s.key)}
                          title={s.label}
                        >
                          <span className="gift-share-shape-icon">{s.icon}</span>
                          <span className="gift-share-shape-label">{s.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Color selector */}
                    <div className="gift-share-colors">
                      <span className="gift-share-color-label">Өнгө:</span>
                      {QR_COLORS.map((c) => (
                        <button
                          key={c.color}
                          className={`gift-share-color-btn ${shareColor === c.color ? "gift-share-color-active" : ""}`}
                          style={{ background: c.color }}
                          onClick={() => setShareColor(c.color)}
                          title={c.label}
                          aria-label={c.label}
                        />
                      ))}
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
                          alt="QR Code"
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

                    {/* Download & Print */}
                    <div className="gift-share-panel-actions">
                      <button
                        className="gift-share-panel-action-btn"
                        onClick={handleShareDownload}
                        disabled={!sharePanel.qr}
                        title="QR татах"
                      >
                        <MdDownload /> Татах
                      </button>
                      <button
                        className="gift-share-panel-action-btn"
                        onClick={handleSharePrint}
                        disabled={!sharePanel.qr}
                        title="Хэвлэх"
                      >
                        <MdPrint /> Хэвлэх
                      </button>
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
