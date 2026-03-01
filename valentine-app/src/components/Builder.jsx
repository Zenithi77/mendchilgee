import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Logo from "../assets/Logo";
import { createEmptyGift, SECTION_TYPES } from "../models/gift";
import { SECTION_REGISTRY } from "../sections/sectionRegistry";
import { createDefaultSection } from "../models/sectionDefaults";
import { saveOrUpdateGift, getGift } from "../services/giftService";
import { useAuth } from "../contexts/AuthContext";

import AddSectionModal from "./AddSectionModal";
import UpgradeModal from "./UpgradeModal";
import { VIEWPORT_PRESETS } from "./GiftPreview";
import { TEMPLATES } from "../templateConfigs";
import { TIER_META } from "../config/tiers";
import { FEATURE_REGISTRY } from "../config/featureRegistry";
import {
  getRequiredTier,
  needsUpgrade,
  getRemainingDays,
} from "../utils/tierUtils";
import { IoClose, IoColorPalette, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import {
  IoMdPhonePortrait,
  IoIosTabletLandscape,
  IoMdDesktop,
} from "react-icons/io";

import {
  WelcomeLetterEditor,
  QuestionEditor,
  MovieSelectionEditor,
  MemoryGalleryEditor,
  StepQuestionsEditor,
  FinalSummaryEditor,
  MemoryVideoEditor,
  GenericEditor,
} from "./SectionEditors";

import "./Builder.css";
import "./ShareModal.css";

const DEFAULT_BUILDER_THEME = {
  className: "theme-classic",
  colors: {
    "--t-primary": "#FFC4D0",
    "--t-secondary": "#F7DDDE",
    "--t-accent": "#FBE8E7",
    "--t-accent2": "#FCF5EE",
    "--t-soft": "#FBE8E7",
    "--t-light": "#FCF5EE",
    "--t-bg": "#111518",
    "--t-bg2": "#1c2025",
    "--t-glass": "rgba(255, 255, 255, 0.04)",
    "--t-glass-border": "rgba(255, 196, 208, 0.15)",
  },
};

const DEFAULT_EFFECTS = {
  floatingHearts: ["🎉", "✨", "🌟", "🎊", "⭐"],
  heartRain: ["🎉", "✨", "🌸", "🌟", "🎊", "⭐"],
  confettiColors: ["#FFC4D0", "#F7DDDE", "#FBE8E7", "#FCF5EE"],
  clickSparkles: ["✨", "🌟", "🎉", "⭐"],
  flowers: [],
  leafEmoji: "🍃",
  stickers: ["🎉", "✨", "🌟", "🎊", "🎁", "🌸"],
};

export default function Builder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { giftId: urlGiftId } = useParams();
  const location = useLocation();
  const stateGift = location.state?.initialGift;

  const [gift, setGift] = useState(() => {
    const g = stateGift
      ? JSON.parse(JSON.stringify(stateGift))
      : urlGiftId
        ? null // will be loaded from Firestore
        : createEmptyGift();
    if (g && !g.theme?.className) g.theme = { ...DEFAULT_BUILDER_THEME };
    if (g && !g.effects?.floatingHearts) g.effects = { ...DEFAULT_EFFECTS };
    return g;
  });

  const [giftLoading, setGiftLoading] = useState(!!urlGiftId && !stateGift);

  // Load gift from Firestore when accessed via /builder/:giftId
  useEffect(() => {
    if (!urlGiftId || stateGift || gift?.id === urlGiftId) return;
    let cancelled = false;
    (async () => {
      try {
        setGiftLoading(true);
        const data = await getGift(urlGiftId);
        if (cancelled) return;
        if (data) {
          // Only the owner can access the builder for this gift
          if (data.userId !== user?.uid) {
            navigate("/", { replace: true });
            return;
          }
          if (!data.theme?.className) data.theme = { ...DEFAULT_BUILDER_THEME };
          if (!data.effects?.floatingHearts)
            data.effects = { ...DEFAULT_EFFECTS };
          setGift(data);
          if (data.sections?.length > 0)
            setSelectedSectionId(data.sections[0].id);
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Failed to load gift:", err);
        navigate("/", { replace: true });
      } finally {
        if (!cancelled) setGiftLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [urlGiftId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedSectionId, setSelectedSectionId] = useState(() => {
    if (stateGift?.sections?.length > 0) return stateGift.sections[0].id;
    return null;
  });

  // ── Slide-based navigation ──
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const slideTrackRef = useRef(null);
  const [pendingFocusSectionId, setPendingFocusSectionId] = useState(null);

  // ── Phone iframe scale ──
  const phoneScreenRef = useRef(null);
  const [iframeScale, setIframeScale] = useState(0.58);
  const [iframeHeight, setIframeHeight] = useState(844);

  useEffect(() => {
    const el = phoneScreenRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        const s = w / 390;
        setIframeScale(s);
        setIframeHeight(Math.ceil(h / s));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [gift?.id]);

  // Sync selectedSectionId from activeSlideIndex
  useEffect(() => {
    const sec = gift?.sections?.[activeSlideIndex];
    if (sec && sec.id !== selectedSectionId) {
      setSelectedSectionId(sec.id);
      setSectionSnapshot(JSON.parse(JSON.stringify(sec.data)));
    }
  }, [activeSlideIndex, gift?.sections]);

  // Clamp activeSlideIndex when sections change
  useEffect(() => {
    if (gift?.sections && activeSlideIndex >= gift.sections.length) {
      setActiveSlideIndex(Math.max(0, gift.sections.length - 1));
    }
  }, [gift?.sections?.length]);

  // Focus newly added section
  useEffect(() => {
    if (pendingFocusSectionId && gift?.sections) {
      const idx = gift.sections.findIndex((s) => s.id === pendingFocusSectionId);
      if (idx >= 0) {
        setActiveSlideIndex(idx);
      }
      setPendingFocusSectionId(null);
    }
  }, [pendingFocusSectionId, gift?.sections]);

  // Slide navigation helpers
  const goToSlide = useCallback(
    (idx) => {
      const len = gift?.sections?.length ?? 0;
      if (len > 0 && idx >= 0 && idx < len) {
        setActiveSlideIndex(idx);
      }
    },
    [gift?.sections?.length],
  );

  const prevSlide = useCallback(
    () => goToSlide(activeSlideIndex - 1),
    [activeSlideIndex, goToSlide],
  );
  const nextSlide = useCallback(
    () => goToSlide(activeSlideIndex + 1),
    [activeSlideIndex, goToSlide],
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Auto-open upgrade modal when redirected from public view with ?upgrade=true
  const locationObj = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(locationObj.search);
    if (params.get("upgrade") === "true") {
      setShowUpgradeModal(true);
      // Clean up the URL param without navigation
      const url = new URL(window.location);
      url.searchParams.delete("upgrade");
      window.history.replaceState({}, "", url);
    }
  }, [locationObj.search]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [previewReloadKey, setPreviewReloadKey] = useState(0);

  // ── Tier calculations (memoized, deterministic) ──
  const requiredTier = useMemo(
    () => (gift ? getRequiredTier(gift.sections) : "free"),
    [gift?.sections],
  );
  const showUpgradeBtn = useMemo(
    () => (gift ? needsUpgrade(gift) : false),
    [gift],
  );
  const requiredTierMeta = TIER_META[requiredTier];
  const remainingDays = useMemo(
    () => getRemainingDays(gift?.expiresAt),
    [gift?.expiresAt],
  );

  // ✅ Responsive view state (header-д)
  const [viewport, setViewport] = useState("desktop"); // desktop|tablet|mobile

  // Auto switch preview viewport based on screen size
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 640) setViewport("mobile");
      else if (width < 1024) setViewport("tablet");
      else setViewport("desktop");
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // ── Unsaved-changes guard ──
  const [sectionSnapshot, setSectionSnapshot] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // ✅ Sidebar drawer open/close (mobile/tablet)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedSection = gift?.sections?.find(
    (s) => s.id === selectedSectionId,
  );

  // Helper: check if the current section data has diverged from the snapshot
  const hasUnsavedEditorChanges = useCallback(() => {
    if (!sectionSnapshot || !selectedSection) return false;
    return (
      JSON.stringify(selectedSection.data) !== JSON.stringify(sectionSnapshot)
    );
  }, [sectionSnapshot, selectedSection]);

  // Attempt to collapse the editor; shows warning if unsaved changes exist
  const requestCloseEditor = useCallback(() => {
    if (hasUnsavedEditorChanges()) {
      setShowUnsavedWarning(true);
    } else {
      setSelectedSectionId(null);
      setSectionSnapshot(null);
    }
  }, [hasUnsavedEditorChanges]);

  // Discard changes: revert section data to the snapshot and collapse
  const discardEditorChanges = useCallback(() => {
    if (sectionSnapshot && selectedSectionId) {
      setGift((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === selectedSectionId
            ? { ...s, data: JSON.parse(JSON.stringify(sectionSnapshot)) }
            : s,
        ),
      }));
    }
    setShowUnsavedWarning(false);
    setSelectedSectionId(null);
    setSectionSnapshot(null);
  }, [sectionSnapshot, selectedSectionId]);

  const addSection = useCallback((type) => {
    const section = createDefaultSection(type);
    setGift((prev) => {
      // Place video section right after photo gallery by default
      if (type === SECTION_TYPES.MEMORY_VIDEO) {
        const galleryIndex = prev.sections.findIndex(
          (s) => s.type === SECTION_TYPES.MEMORY_GALLERY,
        );
        if (galleryIndex !== -1) {
          const nextSections = [...prev.sections];
          nextSections.splice(galleryIndex + 1, 0, section);
          return { ...prev, sections: nextSections };
        }
      }

      return { ...prev, sections: [...prev.sections, section] };
    });
    setPendingFocusSectionId(section.id);
    setShowAddModal(false);
    // Snapshot the newly created section so cancelling reverts to it
    setSectionSnapshot(JSON.parse(JSON.stringify(section.data)));
  }, []);

  const updateSectionData = useCallback((sectionId, newData) => {
    setGift((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, data: newData } : s,
      ),
    }));
  }, []);

  const deleteSection = useCallback((sectionId) => {
    setGift((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      if (prev.sections.length <= 1) return prev;

      const nextSections = prev.sections.filter((s) => s.id !== sectionId);
      return { ...prev, sections: nextSections };
    });
    // activeSlideIndex will be clamped by the effect
  }, []);

  const applyTemplate = useCallback((tmpl) => {
    if (!tmpl) return;
    setGift((prev) => ({
      ...prev,
      theme: tmpl.theme || prev.theme,
      effects: tmpl.effects || prev.effects,
    }));
    setPreviewReloadKey((k) => k + 1);
  }, []);

  const handleSave = useCallback(async () => {
    if (!user || !gift) return;
    try {
      setSaving(true);
      setSaveStatus(null);
      // Compute and persist requiredTier before saving
      const tierToSave = getRequiredTier(gift.sections);
      const giftToSave = { ...gift, requiredTier: tierToSave };
      const docId = await saveOrUpdateGift(giftToSave, user.uid);
      setGift((prev) => ({ ...prev, id: docId, requiredTier: tierToSave }));
      // Update URL to include giftId if not already present
      if (docId && !urlGiftId) {
        navigate(`/builder/${docId}`, { replace: true });
      }
      setPreviewReloadKey((k) => k + 1);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2500);
      return docId;
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
      return null;
    } finally {
      setSaving(false);
    }
  }, [gift, user, urlGiftId, navigate]);

  // Save changes from the warning modal, then collapse
  const saveAndCloseEditor = useCallback(async () => {
    setShowUnsavedWarning(false);
    await handleSave();
    setSelectedSectionId(null);
    setSectionSnapshot(null);
  }, [handleSave]);

  const autoSaveOnceRef = useRef(false);
  useEffect(() => {
    if (autoSaveOnceRef.current) return;
    if (gift && !gift.id && user) {
      autoSaveOnceRef.current = true;
      (async () => {
        try {
          await handleSave();
        } catch (err) {
          console.error("Auto-save error:", err);
        }
      })();
    }
  }, [gift?.id, user, handleSave]);

  const openFullPreview = useCallback(async () => {
    const docId = gift?.id || (await handleSave());
    if (docId) navigate(`/${docId}`);
  }, [gift?.id, handleSave, navigate]);

  const getSectionLabel = (section) => {
    const reg = SECTION_REGISTRY[section.type];
    return reg ? reg.labelMn || reg.label : section.type;
  };

  const getSectionIcon = (section) => {
    const reg = SECTION_REGISTRY[section.type];
    return reg ? reg.icon : "📄";
  };

  const renderEditor = () => {
    if (!selectedSection) return null;

    const { type } = selectedSection;

    if (type === SECTION_TYPES.WELCOME) {
      return (
        <WelcomeLetterEditor
          welcomeSection={selectedSection}
          letterSection={null}
          onUpdate={updateSectionData}
        />
      );
    }

    if (type === SECTION_TYPES.LOVE_LETTER) {
      return (
        <WelcomeLetterEditor
          welcomeSection={null}
          letterSection={selectedSection}
          onUpdate={updateSectionData}
        />
      );
    }

    if (type === SECTION_TYPES.QUESTION)
      return (
        <QuestionEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );

    if (type === SECTION_TYPES.MOVIE_SELECTION)
      return (
        <MovieSelectionEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );

    if (type === SECTION_TYPES.MEMORY_GALLERY)
      return (
        <MemoryGalleryEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );

    if (type === SECTION_TYPES.STEP_QUESTIONS)
      return (
        <StepQuestionsEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );

    if (type === SECTION_TYPES.FINAL_SUMMARY)
      return (
        <FinalSummaryEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );

    if (type === SECTION_TYPES.MEMORY_VIDEO)
      return (
        <MemoryVideoEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );

    if (type === SECTION_TYPES.SPECIAL_QUESTIONS)
      return <GenericEditor section={selectedSection} />;

    return <GenericEditor section={selectedSection} />;
  };

  // ── Slide preview card renderer ──
  const renderSlidePreview = (section) => {
    const { type, data } = section;
    const reg = SECTION_REGISTRY[type];
    const icon = reg?.icon || "📄";
    const label = reg?.labelMn || reg?.label || type;

    switch (type) {
      case SECTION_TYPES.WELCOME:
        return (
          <div className="slide-pv slide-pv-welcome">
            <div className="slide-pv-emoji">{data?.character?.bodyEmoji || data?.character?.envelopeEmojis?.heart || "💝"}</div>
            <h3 className="slide-pv-title">{data?.title || "Мэндчилгээ"}</h3>
            <p className="slide-pv-sub">{data?.subtitle || ""}</p>
            {data?.buttonText && (
              <div className="slide-pv-mock-btn">{data.buttonText}</div>
            )}
          </div>
        );

      case SECTION_TYPES.LOVE_LETTER:
        return (
          <div className="slide-pv slide-pv-letter">
            <div className="slide-pv-letter-icon">💌</div>
            <div className="slide-pv-letter-text">
              {(data?.content || "Захидлын агуулга...").slice(0, 150)}
              {(data?.content || "").length > 150 ? "..." : ""}
            </div>
          </div>
        );

      case SECTION_TYPES.QUESTION:
        return (
          <div className="slide-pv slide-pv-question">
            <div className="slide-pv-question-icon">{icon}</div>
            <div className="slide-pv-question-text">
              {data?.text || "Асуулга хэсэг"}
            </div>
            {data?.yesButton && (
              <div className="slide-pv-mock-btn">{data.yesButton.text} {data.yesButton.emoji}</div>
            )}
          </div>
        );

      case SECTION_TYPES.MEMORY_GALLERY: {
        const photos = data?.memories?.filter((m) => m.src) || [];
        return (
          <div className="slide-pv slide-pv-gallery">
            {photos.length > 0 ? (
              <div className="slide-pv-photos">
                {photos.slice(0, 4).map((m, i) => (
                  <div key={i} className="slide-pv-photo">
                    <img src={m.src} alt="" />
                  </div>
                ))}
                {photos.length > 4 && (
                  <div className="slide-pv-photo-more">+{photos.length - 4}</div>
                )}
              </div>
            ) : (
              <div className="slide-pv-gallery-empty">
                <span>📸</span>
                <span>{data?.headerTitle || "Зургийн цомог"}</span>
              </div>
            )}
          </div>
        );
      }

      case SECTION_TYPES.MOVIE_SELECTION: {
        const movies = data?.movies || [];
        return (
          <div className="slide-pv slide-pv-movies">
            <div className="slide-pv-movies-title">{data?.title || "Кино сонголт"}</div>
            <div className="slide-pv-movies-grid">
              {movies.slice(0, 3).map((m, i) => (
                <div key={i} className="slide-pv-movie">
                  {m.posterUrl ? (
                    <img src={m.posterUrl} alt={m.title} />
                  ) : (
                    <span>🎬</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case SECTION_TYPES.MEMORY_VIDEO:
        return (
          <div className="slide-pv slide-pv-video">
            <div className="slide-pv-video-icon">🎬</div>
            <div className="slide-pv-video-label">{label}</div>
            {data?.url && (
              <div className="slide-pv-video-url">{data.url.slice(0, 40)}...</div>
            )}
          </div>
        );

      case SECTION_TYPES.STEP_QUESTIONS:
        return (
          <div className="slide-pv slide-pv-steps">
            <div className="slide-pv-steps-icon">📝</div>
            <div className="slide-pv-steps-label">{label}</div>
            {data?.steps && (
              <div className="slide-pv-steps-list">
                {data.steps.slice(0, 3).map((s, i) => (
                  <div key={i} className="slide-pv-step-item">
                    {s.emoji} {s.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case SECTION_TYPES.FINAL_SUMMARY:
        return (
          <div className="slide-pv slide-pv-summary">
            <div className="slide-pv-summary-icon">{data?.headerEmoji || "🎊"}</div>
            <div className="slide-pv-summary-label">{data?.title || label}</div>
          </div>
        );

      default:
        return (
          <div className="slide-pv slide-pv-generic">
            <div className="slide-pv-generic-icon">{icon}</div>
            <div className="slide-pv-generic-label">{label}</div>
          </div>
        );
    }
  };

  // Show loading state while fetching gift from Firestore
  if (giftLoading || !gift) {
    return (
      <div
        className="builder"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎉</div>
          <p>Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="builder">
      <AddSectionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelect={addSection}
      />

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        gift={gift}
        giftId={gift.id}
      />

      <header className="builder-header">
        <div className="builder-header-left">
          <button
            className="builder-btn builder-btn-outline"
            onClick={() => navigate("/")}
          >
            <span className="builder-btn-icon">←</span>
            <span className="builder-btn-exit-txt">Буцах</span>
          </button>

          {/* ✅ Mobile: open style panel drawer */}
          <button
            type="button"
            className="builder-menu-btn"
            onClick={() => {
              setShowStylePanel(true);
              setSidebarOpen(true);
            }}
            aria-label="Open style"
            title="Загвар"
          >
            <IoColorPalette />
          </button>

          {/* ── Tier badge in header ── */}
          {requiredTier !== "free" && (
            <>
              <div className="builder-divider" />
              <span
                className="builder-tier-badge builder-tier-badge-hide-mobile"
                style={{
                  background: requiredTierMeta.bgColor,
                  color: requiredTierMeta.color,
                }}
                title={`Энэ мэндчилгээ ${requiredTierMeta.label} plan шаардана`}
              >
                {requiredTierMeta.badge} {requiredTierMeta.label}
              </span>
            </>
          )}
        </div>

        <div className="builder-header-right">
          <button
            className="builder-btn builder-btn-outline builder-btn-preview"
            onClick={openFullPreview}
            disabled={gift.sections.length === 0 || saving}
          >
            <span className="builder-btn-icon">↗</span>
            <span className="builder-btn-preview-txt">Урьдчилан харах</span>
          </button>

          <div className="builder-divider" />

          {saveStatus === "saved" && (
            <span className="builder-save-badge builder-save-ok">
              ✓ Хадгалсан
            </span>
          )}
          {saveStatus === "error" && (
            <span className="builder-save-badge builder-save-err">✕ Алдаа</span>
          )}

          {/* ── Upgrade / Remove Watermark button ── */}
          {showUpgradeBtn && (
            <button
              className="builder-btn builder-btn-upgrade"
              onClick={() => setShowUpgradeModal(true)}
            >
              <span>✨ Watermark арилгах</span>
            </button>
          )}
        </div>
      </header>

      <div className="builder-body">
        {/* ✅ Sidebar overlay (mobile/tablet - only for style panel) */}
        {sidebarOpen && (
          <div
            className="builder-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ═══ LEFT PANEL: Editor Sidebar ═══ */}
        <aside className={`builder-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="builder-sidebar-inner">
            {/* ✅ Sidebar topbar close (mobile/tablet) */}
            <div className="builder-sidebar-topbar">
              <button
                type="button"
                className="builder-sidebar-close"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                title="Close"
              >
                <IoClose />
              </button>
            </div>

            {/* Tabs: Тохиргоо / Загвар */}
            <div className="button-group-container">
              <button
                className={`builder-tab-btn btn-style ${!showStylePanel ? "active" : ""}`}
                type="button"
                onClick={() => setShowStylePanel(false)}
              >
                <IoIosSettings />
                <span>Тохиргоо</span>
              </button>

              <button
                className={`builder-tab-btn btn-style ${showStylePanel ? "active" : ""}`}
                type="button"
                onClick={() => setShowStylePanel(true)}
              >
                <IoColorPalette />
                <span>Загвар</span>
              </button>
            </div>

            {/* Style / Template selector */}
            {showStylePanel && (
              <div className="builder-settings-panel">
                <div
                  style={{
                    marginBottom: 8,
                    fontSize: 12,
                    color: "#64748b",
                    fontWeight: 700,
                  }}
                >
                  Загвар сонгох
                </div>

                <div className="template-grid">
                  {TEMPLATES.map((tmpl, i) => {
                    const cols = tmpl.theme?.colors || {};
                    const primary =
                      cols["--t-primary"] || cols["--t-secondary"] || "#ff6b9d";
                    const accent = cols["--t-accent"] || primary;
                    const isSelected =
                      gift.theme?.className === tmpl.theme?.className;
                    const bg = `linear-gradient(135deg, ${accent}, ${primary})`;

                    return (
                      <button
                        key={tmpl.id || i}
                        type="button"
                        className={`template-tile template-${i + 1} ${isSelected ? "selected" : ""}`}
                        onClick={async () => {
                          applyTemplate(tmpl);
                          await handleSave();
                          setSidebarOpen(false);
                        }}
                        title={tmpl.card?.name || tmpl.id}
                        style={{ background: bg }}
                        disabled={saving}
                      >
                        <div className="template-tile-label">
                          {tmpl.card?.name || tmpl.id}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Settings tab: current section's editor */}
            {!showStylePanel && (
              <>
                {/* Add + Save buttons */}
                <button
                  className="builder-add-btn"
                  onClick={() => setShowAddModal(true)}
                  type="button"
                >
                  <span className="builder-add-icon">＋</span>
                  Хуудас нэмэх
                </button>

                <button
                  className="builder-add-btn builder-add-btn-save"
                  onClick={handleSave}
                  disabled={saving || gift.sections.length === 0}
                  type="button"
                >
                  <span>{saving ? "Хадгалж байна..." : "💾 Хадгалах"}</span>
                </button>

                {/* Active section header badge */}
                {selectedSection && (
                  <div className="builder-active-section-header">
                    <div className="builder-active-section-left">
                      <span className="builder-active-section-icon">
                        {getSectionIcon(selectedSection)}
                      </span>
                      <span className="builder-active-section-name">
                        {getSectionLabel(selectedSection)}
                      </span>
                      <span className="builder-active-section-counter">
                        {activeSlideIndex + 1}/{gift.sections.length}
                      </span>
                    </div>
                    <div className="builder-active-section-actions">
                      {/* Navigate to previous section */}
                      <button
                        type="button"
                        className="builder-action-btn builder-action-nav"
                        onClick={() => goToSlide(activeSlideIndex - 1)}
                        disabled={activeSlideIndex <= 0}
                        title="Өмнөх хуудас"
                      >
                        ◀
                      </button>
                      {/* Navigate to next section */}
                      <button
                        type="button"
                        className="builder-action-btn builder-action-nav"
                        onClick={() => goToSlide(activeSlideIndex + 1)}
                        disabled={activeSlideIndex >= gift.sections.length - 1}
                        title="Дараагийн хуудас"
                      >
                        ▶
                      </button>
                      {/* Delete */}
                      <button
                        type="button"
                        className="builder-action-btn builder-action-delete"
                        onClick={() => {
                          if (
                            window.confirm(
                              `"${getSectionLabel(selectedSection)}" хэсгийг устгах уу?`
                            )
                          ) {
                            deleteSection(selectedSection.id);
                          }
                        }}
                        title={
                          gift.sections.length <= 1
                            ? "Хамгийн багадаа 1 хэсэг байх ёстой"
                            : "Устгах"
                        }
                        disabled={gift.sections.length <= 1}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                )}

                {/* Section editor content */}
                {selectedSection ? (
                  <div className="builder-section-editor-wrap">
                    {renderEditor()}
                  </div>
                ) : gift.sections.length === 0 ? (
                  <div className="builder-section-empty">
                    <span className="builder-section-empty-icon">📋</span>
                    <p>Section нэмэгдээгүй байна</p>
                    <p className="builder-section-empty-hint">
                      Дээрх товч дарж section нэмнэ үү
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>


        </aside>

        {/* ═══ MOBILE: Phone Preview with real iframe ═══ */}
        {gift.id && (
          <div className="builder-phone-preview-panel">
            <div className="builder-phone-frame">
              <div className="builder-phone-notch" />
              <div className="builder-phone-screen" ref={phoneScreenRef}>
                <iframe
                  key={previewReloadKey}
                  className="builder-phone-iframe"
                  src={`/${gift.id}`}
                  title="Урьдчилан харах"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  style={{ transform: `scale(${iframeScale})`, height: `${iframeHeight}px` }}
                />
              </div>
              <div className="builder-phone-home-bar" />
            </div>
            <button
              type="button"
              className="builder-phone-reload-btn"
              onClick={() => setPreviewReloadKey((k) => k + 1)}
              title="Шинэчлэх"
            >
              🔄 Шинэчлэх
            </button>
          </div>
        )}

        {/* ═══ RIGHT PANEL: Slide Carousel (desktop) ═══ */}
        <main className="builder-main builder-slides-main">
          <div className="builder-slides-container">
            {/* Navigation arrow left */}
            <button
              type="button"
              className="builder-slide-arrow builder-slide-arrow-left"
              onClick={prevSlide}
              disabled={activeSlideIndex <= 0}
            >
              <IoChevronBack />
            </button>

            {/* Slides track */}
            <div className="builder-slides-viewport">
              <div
                className="builder-slides-track"
                ref={slideTrackRef}
                style={{
                  transform: `translateX(-${activeSlideIndex * 100}%)`,
                }}
              >
                {gift.sections.map((section, idx) => {
                  const isActive = idx === activeSlideIndex;
                  const reg = SECTION_REGISTRY[section.type];
                  const feat = FEATURE_REGISTRY[section.type];
                  const tierDot =
                    feat && feat.requiredTier !== "free"
                      ? TIER_META[feat.requiredTier]
                      : null;

                  return (
                    <div
                      key={section.id}
                      className={`builder-slide-card ${isActive ? "active" : ""}`}
                      onClick={() => goToSlide(idx)}
                    >
                      <div className="builder-slide-card-label">
                        <span>{reg?.icon || "📄"}</span>
                        <span>{reg?.labelMn || reg?.label || section.type}</span>
                        {tierDot && (
                          <span
                            className="builder-section-tier-dot"
                            style={{ color: tierDot.color }}
                          >
                            {tierDot.badge}
                          </span>
                        )}
                      </div>
                      <div className="builder-slide-card-body">
                        {renderSlidePreview(section)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation arrow right */}
            <button
              type="button"
              className="builder-slide-arrow builder-slide-arrow-right"
              onClick={nextSlide}
              disabled={activeSlideIndex >= gift.sections.length - 1}
            >
              <IoChevronForward />
            </button>
          </div>

          {/* Slide dots indicator */}
          {gift.sections.length > 1 && (
            <div className="builder-slide-dots">
              {gift.sections.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`builder-slide-dot ${idx === activeSlideIndex ? "active" : ""}`}
                  onClick={() => goToSlide(idx)}
                />
              ))}
            </div>
          )}
        </main>

        {/* ✅ Mobile bottom action bar */}
        <div className="builder-mobile-bar">
          <button
            type="button"
            className="builder-mobile-bar-btn"
            onClick={() => goToSlide(activeSlideIndex - 1)}
            disabled={activeSlideIndex <= 0}
          >
            <span>◀</span>
            <span>Өмнөх</span>
          </button>
          <button
            type="button"
            className="builder-mobile-bar-btn builder-mobile-bar-add"
            onClick={() => setShowAddModal(true)}
          >
            <span className="builder-mobile-bar-plus">＋</span>
          </button>
          <button
            type="button"
            className="builder-mobile-bar-btn"
            onClick={handleSave}
            disabled={saving || gift.sections.length === 0}
          >
            <span>{saving ? "⏳" : "💾"}</span>
            <span>{saving ? "..." : "Хадгалах"}</span>
          </button>
          <button
            type="button"
            className="builder-mobile-bar-btn"
            onClick={() => goToSlide(activeSlideIndex + 1)}
            disabled={activeSlideIndex >= gift.sections.length - 1}
          >
            <span>▶</span>
            <span>Дараах</span>
          </button>
        </div>

        {/* ✅ Unsaved-changes warning modal */}
        {showUnsavedWarning && (
          <>
            <div className="builder-unsaved-overlay" />
            <div className="builder-unsaved-modal">
              <div className="builder-unsaved-icon">⚠️</div>
              <h3 className="builder-unsaved-title">
                Хадгалаагүй өөрчлөлт байна
              </h3>
              <p className="builder-unsaved-text">
                Та өөрчлөлтөө хадгалахгүйгээр хаах гэж байна. Хадгалах уу?
              </p>
              <div className="builder-unsaved-actions">
                <button
                  type="button"
                  className="builder-btn builder-btn-save"
                  onClick={saveAndCloseEditor}
                  disabled={saving}
                >
                  {saving ? "Хадгалж байна..." : "💾 Хадгалах"}
                </button>
                <button
                  type="button"
                  className="builder-btn builder-btn-outline builder-btn-discard"
                  onClick={discardEditorChanges}
                >
                  Цуцлах
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
