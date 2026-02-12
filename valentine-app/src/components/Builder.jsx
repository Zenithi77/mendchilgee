import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { createEmptyGift, SECTION_TYPES } from "../models/gift";
import { SECTION_REGISTRY } from "../sections/sectionRegistry";
import { createDefaultSection } from "../models/sectionDefaults";
import { saveOrUpdateGift } from "../services/giftService";
import { useAuth } from "../contexts/AuthContext";

import AddSectionModal from "./AddSectionModal";
import GiftPreview, { VIEWPORT_PRESETS } from "./GiftPreview";
import { TEMPLATES } from "../templateConfigs";
import { IoMdMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { IoColorPalette } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { IoMdPhonePortrait, IoIosTabletLandscape, IoMdDesktop } from "react-icons/io";

import {
  WelcomeLetterEditor,
  QuestionEditor,
  MemoryGalleryEditor,
  StepQuestionsEditor,
  FinalSummaryEditor,
  MemoryVideoEditor,
  GenericEditor,
} from "./SectionEditors";

import "./Builder.css";

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

export default function Builder({ onBack, initialGift }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gift, setGift] = useState(() => {
    const g = initialGift
      ? JSON.parse(JSON.stringify(initialGift))
      : createEmptyGift();
    if (!g.theme?.className) g.theme = { ...DEFAULT_BUILDER_THEME };
    if (!g.effects?.floatingHearts) g.effects = { ...DEFAULT_EFFECTS };
    return g;
  });

  const [selectedSectionId, setSelectedSectionId] = useState(() => {
    if (initialGift?.sections?.length > 0) return initialGift.sections[0].id;
    return null;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [previewReloadKey, setPreviewReloadKey] = useState(0);

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

  // ✅ Sidebar drawer open/close (mobile/tablet)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedSection = gift.sections.find((s) => s.id === selectedSectionId);

  const startDate = useMemo(() => {
    const welcomeSec = gift.sections.find((s) => s.type === SECTION_TYPES.WELCOME);
    const dateStr = welcomeSec?.data?.startDate;
    return dateStr ? new Date(dateStr) : new Date();
  }, [gift.sections]);

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
    if (!user) return;
    try {
      setSaving(true);
      setSaveStatus(null);
      const docId = await saveOrUpdateGift(gift, user.uid);
      setGift((prev) => ({ ...prev, id: docId }));
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
  }, [gift, user]);

  const autoSaveOnceRef = useRef(false);
  useEffect(() => {
    if (autoSaveOnceRef.current) return;
    if (!gift?.id && user) {
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
    const docId = gift.id || (await handleSave());
    if (docId) navigate(`/preview/${docId}`);
  }, [gift.id, handleSave, navigate]);

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

    if (type === SECTION_TYPES.WELCOME || type === SECTION_TYPES.LOVE_LETTER) {
      const welcomeSec = gift.sections.find((s) => s.type === SECTION_TYPES.WELCOME);
      const letterSec = gift.sections.find((s) => s.type === SECTION_TYPES.LOVE_LETTER);
      return (
        <WelcomeLetterEditor
          welcomeSection={welcomeSec}
          letterSection={letterSec}
          onUpdate={updateSectionData}
        />
      );
    }

    if (type === SECTION_TYPES.QUESTION)
      return <QuestionEditor section={selectedSection} onUpdate={updateSectionData} />;

    if (type === SECTION_TYPES.MEMORY_GALLERY)
      return <MemoryGalleryEditor section={selectedSection} onUpdate={updateSectionData} />;

    if (type === SECTION_TYPES.STEP_QUESTIONS)
      return <StepQuestionsEditor section={selectedSection} onUpdate={updateSectionData} />;

    if (type === SECTION_TYPES.FINAL_SUMMARY)
      return <FinalSummaryEditor section={selectedSection} onUpdate={updateSectionData} />;

    if (type === SECTION_TYPES.MEMORY_VIDEO)
      return <MemoryVideoEditor section={selectedSection} onUpdate={updateSectionData} />;

    return <GenericEditor section={selectedSection} />;
  };

  return (
    <div className="builder">
      <AddSectionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelect={addSection}
      />

      <header className="builder-header">
        <div className="builder-header-left">
          <button className="builder-btn builder-btn-outline" onClick={onBack}>
            <span className="builder-btn-icon">←</span>
            <span className="builder-btn-exit-txt">Буцах</span>
          </button>

          <div className="builder-divider" />

          <span className="builder-project-name">💝 Gift Builder</span>

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

          {/* ✅ Responsive buttons header-д */}
          <div className="builder-divider" />

          <div className="builder-header-viewport">
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
                  <span className="builder-viewport-label">{VIEWPORT_PRESETS[k].label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="builder-header-right">
          <button
            className="builder-btn builder-btn-outline"
            onClick={openFullPreview}
            disabled={gift.sections.length === 0 || saving}
          >
            <span className="builder-btn-icon">↗</span>
            <span>View full screen</span>
          </button>

          <div className="builder-divider" />

          {saveStatus === "saved" && (
            <span className="builder-save-badge builder-save-ok">✓ Хадгалсан</span>
          )}
          {saveStatus === "error" && (
            <span className="builder-save-badge builder-save-err">✕ Алдаа</span>
          )}

          <button
            className="builder-btn builder-btn-save"
            onClick={handleSave}
            disabled={saving || gift.sections.length === 0}
          >
            <span>{saving ? "Хадгалж байна..." : "Хадгалах"}</span>
          </button>
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
                <div style={{ marginBottom: 8, fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                  Choose a template
                </div>

                <div className="template-grid">
                  {TEMPLATES.map((tmpl, i) => {
                    const cols = tmpl.theme?.colors || {};
                    const primary = cols["--t-primary"] || cols["--t-secondary"] || "#ff6b9d";
                    const accent = cols["--t-accent"] || primary;
                    const isSelected = gift.theme?.className === tmpl.theme?.className;
                    const bg = `linear-gradient(135deg, ${accent}, ${primary})`;

                    return (
                      <button
                        key={tmpl.id || i}
                        type="button"
                        className={`template-tile template-${i + 1} ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          applyTemplate(tmpl);
                          setSidebarOpen(false); // ✅ сонгосны дараа хаах
                        }}
                        title={tmpl.card?.name || tmpl.id}
                        style={{ background: bg }}
                      >
                        <div className="template-tile-label">{tmpl.card?.name || tmpl.id}</div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="builder-btn builder-btn-save"
                    onClick={handleSave}
                    disabled={saving}
                    title="Хадгалах"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span>{saving ? "Сонгож байна..." : "Сонгох"}</span>
                  </button>
                </div>
              </div>
            )}

            {!showStylePanel && (
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
                                  selectedSectionId === section.id ? "selected" : ""
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
                                </div>

                                {/* ✅ Edit opens drawer */}
                                <button
                                  type="button"
                                  className="builder-section-edit-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSectionId(section.id);
                                    setEditorOpen(true);
                                    setSidebarOpen(false); // ✅ mobile дээр хаах
                                  }}
                                  title="Edit"
                                >
                                  <MdEdit />
                                </button>
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
              <span className="builder-sidebar-info-count">{gift.sections.length}</span>
              <span>section нэмэгдсэн</span>
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
                    src={`/preview/${gift.id}?r=${previewReloadKey}${
                      selectedSectionId ? `#section-${selectedSectionId}` : ""
                    }`}
                    className="builder-preview-iframe"
                    title="Full preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="builder-preview-placeholder ">

              <h2>Түр хүлээнэ үү...</h2>
            </div>
          )}
        </main>

        {/* ✅ Right drawer editor */}
        {editorOpen && (
          <>
            <div className="builder-drawer-overlay" onClick={() => setEditorOpen(false)} />
            <div className="builder-drawer">
              <div className="builder-drawer-header">
                <div className="builder-drawer-title">
                  <span>
                    {selectedSection ? getSectionLabel(selectedSection) : "Section сонгоно уу"}
                  </span>
                </div>

                <div className="builder-drawer-actions">
                  <button
                    type="button"
                    className="builder-btn builder-btn-save"
                    onClick={async () => {
                      await handleSave();
                    }}
                    disabled={saving}
                    title="Хадгалах"
                  >
                    <span>{saving ? "Хадгалж байна..." : "Хадгалах"}</span>
                  </button>

                  <button
                    type="button"
                    className="builder-btn builder-btn-outline"
                    onClick={() => setEditorOpen(false)}
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
