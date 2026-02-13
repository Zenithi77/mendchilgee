import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Logo from "../assets/Logo";
import { createEmptyGift, SECTION_TYPES } from "../models/gift";
import { SECTION_REGISTRY } from "../sections/sectionRegistry";
import { createDefaultSection } from "../models/sectionDefaults";
import { saveOrUpdateGift, getGift } from "../services/giftService";
import { useAuth } from "../contexts/AuthContext";

import AddSectionModal from "./AddSectionModal";
import UpgradeModal from "./UpgradeModal";
import GiftPreview, { VIEWPORT_PRESETS } from "./GiftPreview";
import { TEMPLATES } from "../templateConfigs";
import { TIER_META } from "../config/tiers";
import { FEATURE_REGISTRY } from "../config/featureRegistry";
import {
  getRequiredTier,
  needsUpgrade,
  getRemainingDays,
} from "../utils/tierUtils";
import { IoMdMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { IoColorPalette } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { MdDelete, MdEdit } from "react-icons/md";
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
    "--t-primary": "#ff6b9d",
    "--t-secondary": "#ff4081",
    "--t-accent": "#c471ed",
    "--t-accent2": "#7c4dff",
    "--t-soft": "#ff9a9e",
    "--t-light": "#ffd1dc",
    "--t-bg": "#0d0015",
    "--t-bg2": "#1a0025",
    "--t-glass": "rgba(255, 255, 255, 0.04)",
    "--t-glass-border": "rgba(255, 100, 150, 0.15)",
  },
};

const DEFAULT_EFFECTS = {
  floatingHearts: ["❤️", "💕", "💖", "💗", "💝"],
  heartRain: ["❤️", "💖", "💗", "💕", "💘", "💝"],
  confettiColors: ["#ff6b9d", "#ff4081", "#c471ed", "#7c4dff"],
  clickSparkles: ["✨", "💖", "💕", "⭐"],
  flowers: [],
  leafEmoji: "🍃",
  stickers: ["💕", "💖", "💗", "💓", "💞", "💘"],
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

  // ✅ Editor drawer open/close
  const [editorOpen, setEditorOpen] = useState(false);

  // ── Unsaved-changes guard ──
  // Snapshot of the section data when the editor drawer opens
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

  // Attempt to close the editor drawer; shows warning if unsaved changes exist
  const requestCloseEditor = useCallback(() => {
    if (hasUnsavedEditorChanges()) {
      setShowUnsavedWarning(true);
    } else {
      setEditorOpen(false);
      setSectionSnapshot(null);
    }
  }, [hasUnsavedEditorChanges]);

  // Discard changes: revert section data to the snapshot and close
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
    setEditorOpen(false);
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
    setSelectedSectionId(section.id);
    setShowAddModal(false);
    // Snapshot the newly created section so cancelling reverts to it
    setSectionSnapshot(JSON.parse(JSON.stringify(section.data)));
    setEditorOpen(true);
    setSidebarOpen(false); // ✅ mobile дээр хаах
  }, []);

  const reorder = useCallback((list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }, []);

  const onDragEnd = useCallback(
    (result) => {
      const { source, destination } = result;
      if (!destination) return;
      if (destination.index === source.index) return;

      setGift((prev) => ({
        ...prev,
        sections: reorder(prev.sections, source.index, destination.index),
      }));
    },
    [reorder],
  );

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
      const nextSelectedId =
        prev.sections[idx + 1]?.id ?? prev.sections[idx - 1]?.id ?? null;

      setSelectedSectionId((current) =>
        current === sectionId ? nextSelectedId : current,
      );

      return { ...prev, sections: nextSections };
    });
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

  // Save changes from the warning modal, then close
  const saveAndCloseEditor = useCallback(async () => {
    setShowUnsavedWarning(false);
    await handleSave();
    setEditorOpen(false);
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
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>💕</div>
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

          {/* ✅ Mobile/Tablet menu button */}
          <button
            type="button"
            className="builder-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            title="Menu"
          >
            <IoMdMenu />
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
                title={`Энэ бэлэг ${requiredTierMeta.label} plan шаардана`}
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
        {/* ✅ Sidebar overlay (mobile/tablet) */}
        {sidebarOpen && (
          <div
            className="builder-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

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

            <div className="button-group-container">
              <button
                className={`builder-tab-btn btn-style ${!showStylePanel ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setShowStylePanel(false);
                }}
              >
                <IoIosSettings />
                <span>Settings</span>
              </button>

              <button
                className={`builder-tab-btn btn-style ${showStylePanel ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setShowStylePanel(true);
                }}
              >
                <IoColorPalette />
                <span>Style</span>
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
                  Choose a template
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
                          // Persist immediately so the iframe preview (loaded from Firestore)
                          // reflects the selected template without needing an extra button.
                          await handleSave();
                          setSidebarOpen(false); // ✅ сонгосны дараа хаах
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

            {!showStylePanel && (
              <>
                <button
                  className="builder-add-btn"
                  onClick={() => {
                    setShowAddModal(true);
                    setSidebarOpen(false); // ✅ mobile дээр хаах
                  }}
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
              </>
            )}

            <div className="builder-section-list">
              {gift.sections.length === 0 && (
                <div className="builder-section-empty">
                  <span className="builder-section-empty-icon">📋</span>
                  <p>Section нэмэгдээгүй байна</p>
                  <p className="builder-section-empty-hint">
                    Дээрх товч дарж section нэмнэ үү
                  </p>
                </div>
              )}

              {gift.sections.length > 0 && (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {gift.sections.map((section, idx) => (
                          <Draggable
                            key={section.id}
                            draggableId={String(section.id)}
                            index={idx}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`builder-section-item ${
                                  selectedSectionId === section.id
                                    ? "selected"
                                    : ""
                                } ${snapshot.isDragging ? "dragging" : ""}`}
                                onClick={() => {
                                  setSelectedSectionId(section.id);
                                  setSidebarOpen(false); // ✅ сонгомогц хаах
                                }}
                              >
                                <div className="builder-section-item-left">
                                  <span
                                    className="builder-drag-handle"
                                    {...provided.dragHandleProps}
                                    onClick={(e) => e.stopPropagation()}
                                    title="Чирж эрэмбэлэх"
                                  >
                                    ⠿
                                  </span>
                                  <span className="builder-section-item-icon">
                                    {getSectionIcon(section)}
                                  </span>
                                  <span className="builder-section-item-name">
                                    {getSectionLabel(section)}
                                  </span>
                                  {/* Tier badge per section */}
                                  {(() => {
                                    const feat = FEATURE_REGISTRY[section.type];
                                    if (feat && feat.requiredTier !== "free") {
                                      const tm = TIER_META[feat.requiredTier];
                                      return (
                                        <span
                                          className="builder-section-tier-dot"
                                          style={{ color: tm.color }}
                                          title={`${tm.label} plan`}
                                        >
                                          {tm.badge}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>

                                <div
                                  className="builder-section-item-actions"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* ✅ Edit opens drawer */}
                                  <button
                                    type="button"
                                    className="builder-action-btn builder-action-edit"
                                    onClick={() => {
                                      setSelectedSectionId(section.id);
                                      // Snapshot the section data at open-time
                                      setSectionSnapshot(
                                        JSON.parse(
                                          JSON.stringify(section.data),
                                        ),
                                      );
                                      setEditorOpen(true);
                                      setSidebarOpen(false); // ✅ mobile дээр хаах
                                    }}
                                    title="Edit"
                                  >
                                    <MdEdit />
                                  </button>

                                  {/* ✅ Delete section */}
                                  <button
                                    type="button"
                                    className="builder-action-btn builder-action-delete"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `"${getSectionLabel(section)}" хэсгийг устгах уу?`,
                                        )
                                      ) {
                                        deleteSection(section.id);
                                      }
                                    }}
                                    title={
                                      gift.sections.length <= 1
                                        ? "At least 1 section must remain"
                                        : "Delete"
                                    }
                                    disabled={gift.sections.length <= 1}
                                  >
                                    <MdDelete />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </div>

          <div className="builder-sidebar-footer">
            <div className="builder-sidebar-info">
              <span className="builder-sidebar-info-count">
                {gift.sections.length}
              </span>
              <span>section нэмэгдсэн</span>
              {remainingDays > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: "0.72rem",
                    color: "#22c55e",
                  }}
                >
                  ⏱ {remainingDays} хоног үлдсэн
                </span>
              )}
            </div>

            {/* Password setup */}
            <div className="pw-setup">
              <div className="pw-setup-title">Нууц үг тохируулах</div>
              <div className="pw-setup-row">
                <label className="pw-setup-label">4 оронтой нууц үг</label>
                <input
                  className="pw-setup-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={gift.password || ""}
                  onChange={(e) => {
                    const val = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 4);
                    setGift((prev) => ({ ...prev, password: val }));
                  }}
                />
                <span className="pw-setup-tip">
                  Жишээ: төрсөн өдрийн 4 орон (0315)
                </span>
              </div>
              <div className="pw-setup-row">
                <label className="pw-setup-label">
                  Нууц үгний санамж (hint)
                </label>
                <input
                  className="pw-setup-hint-input"
                  type="text"
                  placeholder="Жишээ: Миний төрсөн өдөр 🎂"
                  value={gift.passwordHint || ""}
                  onChange={(e) => {
                    setGift((prev) => ({
                      ...prev,
                      passwordHint: e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* ✅ Main = preview only */}
        <main className="builder-main builder-main-previewOnly">
          {gift.id ? (
            <div className="builder-preview-outer">
              <div className="builder-preview-center">
                <div
                  className="builder-preview-frame"
                  style={{
                    width: VIEWPORT_PRESETS[viewport].width,
                    height: VIEWPORT_PRESETS[viewport].height,
                    transform: `scale(1)`,
                  }}
                >
                  <iframe
                    src={`/${gift.id}?r=${previewReloadKey}${
                      selectedSectionId ? `#section-${selectedSectionId}` : ""
                    }`}
                    className="builder-preview-iframe"
                    title="Full preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="builder-preview-placeholder ">
              <h2>Түр хүлээнэ үү...</h2>
            </div>
          )}

          {/* ✅ Viewport toggle under preview */}
          <div className="builder-preview-viewport">
            {["desktop", "tablet", "mobile"].map((k) => {
              const icons = {
                desktop: <IoMdDesktop />,
                tablet: <IoIosTabletLandscape />,
                mobile: <IoMdPhonePortrait />,
              };

              return (
                <button
                  key={k}
                  type="button"
                  className={`builder-viewport-btn ${viewport === k ? "active" : ""}`}
                  onClick={() => setViewport(k)}
                  title={VIEWPORT_PRESETS[k].label}
                >
                  <span className="builder-viewport-icon">{icons[k]}</span>
                  <span className="builder-viewport-label">
                    {VIEWPORT_PRESETS[k].label}
                  </span>
                </button>
              );
            })}
          </div>
        </main>

        {/* ✅ Right drawer editor */}
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

        {editorOpen && (
          <>
            <div
              className="builder-drawer-overlay"
              onClick={requestCloseEditor}
            />
            <div className="builder-drawer">
              <div className="builder-drawer-header">
                <div className="builder-drawer-title">
                  <span>
                    {selectedSection
                      ? getSectionLabel(selectedSection)
                      : "Section сонгоно уу"}
                  </span>
                </div>

                <div className="builder-drawer-actions">
                  <button
                    type="button"
                    className="builder-btn builder-btn-save"
                    onClick={async () => {
                      await handleSave();
                      setEditorOpen(false);
                      setSectionSnapshot(null);
                    }}
                    disabled={saving}
                    title="Хадгалах"
                  >
                    <span>{saving ? "Хадгалж байна..." : "Хадгалах"}</span>
                  </button>

                  <button
                    type="button"
                    className="builder-btn builder-btn-outline"
                    onClick={requestCloseEditor}
                    title="Хаах"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="builder-drawer-body">
                {selectedSection ? (
                  renderEditor()
                ) : (
                  <div className="builder-empty-state">
                    <div className="builder-empty-icon">✨</div>
                    <h3 className="builder-empty-title">Section сонгоно уу</h3>
                    <p className="builder-empty-text">
                      Зүүн талын жагсаалтаас section сонгоод Edit дарна уу.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
