import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGift } from "../services/giftService";
import { updateGift } from "../services/giftService";
import GiftRenderer from "./GiftRenderer";
import Watermark from "./Watermark";
import { shouldShowWatermark, isPaymentExpired } from "../utils/tierUtils";
import "./GiftPreviewPage.css";
import "./ShareModal.css";

/**
 * GiftPreviewPage — standalone page that loads a gift from Firestore
 * by its document ID and renders it full-screen via GiftRenderer.
 *
 * Route: /:giftId
 */
export default function GiftPreviewPage() {
  const { giftId } = useParams();
  const navigate = useNavigate();
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── password gate state ── */
  const [unlocked, setUnlocked] = useState(false);
  const [pwDigits, setPwDigits] = useState(["", "", "", ""]);
  const [pwError, setPwError] = useState(false);
  const digitRefs = [useRef(), useRef(), useRef(), useRef()];

  /* Restore unlock from sessionStorage if previously entered */
  useEffect(() => {
    if (gift?.password && !unlocked) {
      try {
        if (sessionStorage.getItem(`pw-${giftId}`) === "1") {
          setUnlocked(true);
        }
      } catch {
        // sessionStorage may not be available in some environments
      }
    }
  }, [gift, giftId, unlocked]);

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
          // ── Expiration check on load ──
          // If payment has expired, mark it so watermark reappears
          if (!data.paymentExpired && isPaymentExpired(data)) {
            data.paymentExpired = true;
            data.paidTier = "free";
            // Persist expiration to Firestore (fire-and-forget)
            updateGift(giftId, {
              paymentExpired: true,
              paidTier: "free",
            }).catch((err) =>
              console.warn("Failed to persist expiration:", err),
            );
          }

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

  /* ── password gate handlers ── */
  const handlePwDigitChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...pwDigits];
    next[idx] = val;
    setPwDigits(next);
    setPwError(false);
    if (val && idx < 3) digitRefs[idx + 1].current?.focus();
  };

  const handlePwKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !pwDigits[idx] && idx > 0) {
      digitRefs[idx - 1].current?.focus();
    }
  };

  const checkPassword = () => {
    const entered = pwDigits.join("");
    if (entered === gift.password) {
      setUnlocked(true);
      // remember for this session so refresh doesn't re-ask
      try {
        sessionStorage.setItem(`pw-${giftId}`, "1");
      } catch {
        // sessionStorage may not be available in some environments
      }
    } else {
      setPwError(true);
    }
  };

  /* ── password gate screen ── */
  const needsPassword = gift && gift.password && !unlocked;

  // Check if already unlocked this session
  if (gift && gift.password && !unlocked) {
    try {
      if (sessionStorage.getItem(`pw-${giftId}`) === "1") {
        // side-effect in render — schedule state update
        if (!unlocked) setTimeout(() => setUnlocked(true), 0);
      }
    } catch {
      // sessionStorage may not be available in some environments
    }
  }

  let sessionUnlocked = false;
  try {
    sessionUnlocked = sessionStorage.getItem(`pw-${giftId}`) === "1";
  } catch {
    // sessionStorage may not be available in some environments
  }

  if (needsPassword && !sessionUnlocked) {
    return (
      <div className="gift-preview-page pw-gate">
        <div className="pw-gate-icon">🔒</div>
        <h2 className="pw-gate-title">Нууц код шаардлагатай</h2>
        <p className="pw-gate-subtitle">
          Энэ бэлгийг үзэхэд 4 оронтой нууц код оруулна уу
        </p>

        {gift.passwordHint && (
          <p className="pw-gate-hint">
            💡 <span>{gift.passwordHint}</span>
          </p>
        )}

        <div className="pw-gate-input-row">
          {pwDigits.map((d, i) => (
            <input
              key={i}
              ref={digitRefs[i]}
              className={`pw-gate-digit${pwError ? " error" : ""}`}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handlePwDigitChange(i, e.target.value)}
              onKeyDown={(e) => handlePwKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {pwError && <p className="pw-gate-error">Нууц код буруу байна 😢</p>}

        <button
          className="pw-gate-btn"
          disabled={pwDigits.some((d) => !d)}
          onClick={checkPassword}
        >
          Нээх 💝
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
    console.warn("Error parsing URL hash for section index:", e);
    initialIndex = 0;
  }

  // Check if watermark should be shown — only on the public view, not inside
  // the builder's iframe preview.
  const isInIframe = window.self !== window.top;
  const showWatermark = !isInIframe && shouldShowWatermark(gift);

  return (
    <div className={`gift-preview-page app ${gift.theme?.className || ""}`}>
      <GiftRenderer
        gift={gift}
        startDate={startDate}
        category={gift.category}
        initialSectionIndex={initialIndex}
        giftId={giftId}
        persistResponses={true}
      />
      <Watermark visible={showWatermark} />
    </div>
  );
}
