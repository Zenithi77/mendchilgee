// ═══════════════════════════════════════════════════════════════
// PlanSelector — Choose plan + add extra images/video
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import {
  PLANS,
  PLAN_IDS,
  PLAN_ORDER,
  EXTRA_IMAGE_PRICE,
  EXTRA_VIDEO_PRICE,
  VIDEO_SECONDS_INCREMENT,
  MAX_VIDEO_SECONDS,
  calcTotalPrice,
  formatSeconds,
} from "../config/plans";
import { MdAdd, MdRemove, MdCheck, MdPhotoCamera, MdVideocam, MdShoppingCart } from "react-icons/md";
import "./PlanSelector.css";

/**
 * PlanSelector
 *
 * @param {string}   selectedPlan       — current plan ID
 * @param {Function} onSelectPlan       — (planId) => void
 * @param {number}   extraImages        — extra images count
 * @param {Function} onExtraImagesChange — (count) => void
 * @param {number}   extraVideoSeconds  — extra video seconds
 * @param {Function} onExtraVideoChange — (seconds) => void
 * @param {boolean}  showExtras         — whether to show extras section (default: true)
 */
export default function PlanSelector({
  selectedPlan = PLAN_IDS.BASIC,
  onSelectPlan,
  extraImages = 0,
  onExtraImagesChange,
  extraVideoSeconds = 0,
  onExtraVideoChange,
  showExtras = true,
}) {
  const plan = PLANS[selectedPlan] || PLANS[PLAN_IDS.BASIC];

  // Max extra video seconds allowed (total can't exceed 60s)
  const maxExtraVideo = Math.max(0, MAX_VIDEO_SECONDS - plan.includedVideoSeconds);

  const pricing = useMemo(
    () => calcTotalPrice(selectedPlan, extraImages, extraVideoSeconds),
    [selectedPlan, extraImages, extraVideoSeconds],
  );

  return (
    <div className="plan-selector">
      {/* ── Plan Cards ── */}
      <h3 className="plan-selector-title">Багц сонгох</h3>
      <p className="plan-selector-subtitle">
        Өөрт тохирох багцаа сонгоод нэмэлт зураг, видео нэмэх боломжтой
      </p>

      <div className="plan-cards">
        {PLAN_ORDER.map((planId) => {
          const p = PLANS[planId];
          const isSelected = selectedPlan === planId;
          return (
            <div
              key={planId}
              className={`plan-card ${isSelected ? "selected" : ""}`}
              style={{ "--plan-color": p.color }}
              onClick={() => onSelectPlan?.(planId)}
            >
              {p.popular && (
                <span className="plan-card-popular">Түгээмэл</span>
              )}
              <div className="plan-card-check">
                <MdCheck />
              </div>

              <div className="plan-card-icon">{p.icon}</div>
              <div className="plan-card-content">
                <div className="plan-card-name">{p.label}</div>
                <div className="plan-card-price">
                  ₮{p.price.toLocaleString()}
                </div>
                <div className="plan-card-price-suffix">
                  {p.durationDays} хоног
                </div>

                <ul className="plan-card-features">
                  {p.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Extra Purchases ── */}
      {showExtras && (
        <div className="plan-extras">
          <div className="plan-extras-title">
            <MdShoppingCart className="plan-extras-title-icon" />
            Нэмэлт худалдаж авах
          </div>

          {/* Extra Images */}
          <div className="plan-extra-row">
            <div className="plan-extra-info">
              <span className="plan-extra-label">
                <MdPhotoCamera style={{ verticalAlign: "middle", marginRight: 4 }} />
                Нэмэлт зураг
              </span>
              <span className="plan-extra-price">
                ₮{EXTRA_IMAGE_PRICE.toLocaleString()} / зураг
                <span className="plan-included-badge">
                  Багцад {plan.includedImages} зураг орсон
                </span>
              </span>
            </div>
            <div className="plan-extra-controls">
              <button
                className="plan-extra-btn"
                onClick={() => onExtraImagesChange?.(Math.max(0, extraImages - 1))}
                disabled={extraImages <= 0}
              >
                <MdRemove />
              </button>
              <span className="plan-extra-value">{extraImages}</span>
              <button
                className="plan-extra-btn"
                onClick={() => onExtraImagesChange?.(Math.min(50, extraImages + 1))}
                disabled={extraImages >= 50}
              >
                <MdAdd />
              </button>
            </div>
          </div>

          {/* Extra Video Seconds */}
          <div className="plan-extra-row">
            <div className="plan-extra-info">
              <span className="plan-extra-label">
                <MdVideocam style={{ verticalAlign: "middle", marginRight: 4 }} />
                Нэмэлт видео
              </span>
              <span className="plan-extra-price">
                ₮{EXTRA_VIDEO_PRICE.toLocaleString()} / {VIDEO_SECONDS_INCREMENT} сек
                <span className="plan-included-badge">
                  Багцад {formatSeconds(plan.includedVideoSeconds)} орсон
                </span>
              </span>
            </div>
            <div className="plan-extra-controls">
              <button
                className="plan-extra-btn"
                onClick={() =>
                  onExtraVideoChange?.(
                    Math.max(0, extraVideoSeconds - VIDEO_SECONDS_INCREMENT),
                  )
                }
                disabled={extraVideoSeconds <= 0}
              >
                <MdRemove />
              </button>
              <span className="plan-extra-value">
                {formatSeconds(extraVideoSeconds)}
              </span>
              <button
                className="plan-extra-btn"
                onClick={() =>
                  onExtraVideoChange?.(
                    Math.min(maxExtraVideo, extraVideoSeconds + VIDEO_SECONDS_INCREMENT),
                  )
                }
                disabled={extraVideoSeconds >= maxExtraVideo}
              >
                <MdAdd />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Price Summary ── */}
      <div className="plan-summary">
        <div className="plan-summary-row">
          <span>{plan.label} багц</span>
          <span>₮{pricing.planPrice.toLocaleString()}</span>
        </div>
        {pricing.imagesCost > 0 && (
          <div className="plan-summary-row">
            <span>Нэмэлт зураг ×{extraImages}</span>
            <span>₮{pricing.imagesCost.toLocaleString()}</span>
          </div>
        )}
        {pricing.videoCost > 0 && (
          <div className="plan-summary-row">
            <span>Нэмэлт видео ({formatSeconds(extraVideoSeconds)})</span>
            <span>₮{pricing.videoCost.toLocaleString()}</span>
          </div>
        )}
        <div className="plan-summary-divider" />
        <div className="plan-summary-total">
          <span>Нийт</span>
          <span className="plan-summary-total-amount">
            ₮{pricing.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
