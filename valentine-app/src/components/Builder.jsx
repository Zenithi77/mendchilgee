import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createEmptyGift, SECTION_TYPES } from "../models/gift";
import { SECTION_REGISTRY } from "../sections/sectionRegistry";
import { createDefaultSection } from "../models/sectionDefaults";
import { saveOrUpdateGift } from "../services/giftService";
import { useAuth } from "../contexts/AuthContext";
import AddSectionModal from "./AddSectionModal";
import PreviewModal from "./PreviewModal";
import {
  WelcomeLetterEditor,
  QuestionEditor,
  MemoryGalleryEditor,
  StepQuestionsEditor,
  FinalSummaryEditor,
  GenericEditor,
} from "./SectionEditors";
import "./Builder.css";

// ── Default theme applied to the preview frame ──

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

// ═══════════════════════════════════════════════════════════════
// Builder Component
// ═══════════════════════════════════════════════════════════════

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
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "saved" | "error" | null

  // Preview modal state (section-only preview)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSection, setPreviewSection] = useState(null);

  const selectedSection = gift.sections.find((s) => s.id === selectedSectionId);

  // Compute startDate from welcome section data
  const startDate = useMemo(() => {
    const welcomeSec = gift.sections.find(
      (s) => s.type === SECTION_TYPES.WELCOME,
    );
    const dateStr = welcomeSec?.data?.startDate;
    return dateStr ? new Date(dateStr) : new Date();
  }, [gift.sections]);

  // ── Section operations ──

  const addSection = useCallback((type) => {
    const section = createDefaultSection(type);
    setGift((prev) => ({
      ...prev,
      sections: [...prev.sections, section],
    }));
    setSelectedSectionId(section.id);
    setShowAddModal(false);
  }, []);

  const removeSection = useCallback((sectionId) => {
    setGift((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
    setSelectedSectionId((prev) => (prev === sectionId ? null : prev));
  }, []);

  const moveSection = useCallback((sectionId, direction) => {
    setGift((prev) => {
      const sections = [...prev.sections];
      const idx = sections.findIndex((s) => s.id === sectionId);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= sections.length) return prev;
      [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
      return { ...prev, sections };
    });
  }, []);

  // ── Update section data (used by editors) ──

  const updateSectionData = useCallback((sectionId, newData) => {
    setGift((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, data: newData } : s,
      ),
    }));
  }, []);

  // ── Save to Firestore ──

  const handleSave = useCallback(async () => {
    if (!user) return;
    try {
      setSaving(true);
      setSaveStatus(null);
      const docId = await saveOrUpdateGift(gift, user.uid);
      // Store the Firestore ID back into local state
      setGift((prev) => ({ ...prev, id: docId }));
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

  // ── Full preview: save first, then navigate ──

  const openFullPreview = useCallback(async () => {
    const docId = gift.id || (await handleSave());
    if (docId) {
      navigate(`/preview/${docId}`);
    }
  }, [gift.id, handleSave, navigate]);

  // ── Section preview (still modal) ──

  const openSectionPreview = (section) => {
    setPreviewSection(section);
    setPreviewOpen(true);
  };

  // ── Derived data ──

  const getSectionLabel = (section) => {
    const reg = SECTION_REGISTRY[section.type];
    return reg ? reg.labelMn || reg.label : section.type;
  };

  const getSectionIcon = (section) => {
    const reg = SECTION_REGISTRY[section.type];
    return reg ? reg.icon : "📄";
  };

  // ── Determine which editor to show ──

  const renderEditor = () => {
    if (!selectedSection) return null;

    const { type } = selectedSection;

    // Welcome + LoveLetter are combined
    if (type === SECTION_TYPES.WELCOME || type === SECTION_TYPES.LOVE_LETTER) {
      const welcomeSec = gift.sections.find(
        (s) => s.type === SECTION_TYPES.WELCOME,
      );
      const letterSec = gift.sections.find(
        (s) => s.type === SECTION_TYPES.LOVE_LETTER,
      );
      return (
        <WelcomeLetterEditor
          welcomeSection={welcomeSec}
          letterSection={letterSec}
          onUpdate={updateSectionData}
        />
      );
    }

    if (type === SECTION_TYPES.QUESTION) {
      return (
        <QuestionEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );
    }

    if (type === SECTION_TYPES.MEMORY_GALLERY) {
      return (
        <MemoryGalleryEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );
    }

    if (type === SECTION_TYPES.STEP_QUESTIONS) {
      return (
        <StepQuestionsEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );
    }

    if (type === SECTION_TYPES.FINAL_SUMMARY) {
      return (
        <FinalSummaryEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );
    }

    return <GenericEditor section={selectedSection} />;
  };

  // ── Render ──

  return (
    <div className="builder">
      {/* Section Add Modal */}
      <AddSectionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelect={addSection}
      />

      {/* Section Preview Modal (single section only) */}
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        gift={gift}
        section={previewSection}
        mode="section"
        startDate={startDate}
        category={gift.category}
      />

      {/* ─── HEADER ─── */}
      <header className="builder-header">
        <div className="builder-header-left">
          <button className="builder-btn builder-btn-outline" onClick={onBack}>
            <span className="builder-btn-icon">←</span>
            <span>Буцах</span>
          </button>
          <div className="builder-divider" />
          <span className="builder-project-name">💝 Gift Builder</span>
        </div>
        <div className="builder-header-right">
          <button
            className="builder-btn builder-btn-preview"
            onClick={openFullPreview}
            disabled={gift.sections.length === 0 || saving}
          >
            <span className="builder-btn-icon">▶</span>
            <span>Бүрэн Preview</span>
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
          <button
            className="builder-btn builder-btn-save"
            onClick={handleSave}
            disabled={saving || gift.sections.length === 0}
          >
            <span className="builder-btn-icon">{saving ? "⏳" : "💾"}</span>
            <span>{saving ? "Хадгалж байна..." : "Хадгалах"}</span>
          </button>
        </div>
      </header>

      {/* ─── BODY ─── */}
      <div className="builder-body">
        {/* ─── SIDEBAR ─── */}
        <aside className="builder-sidebar">
          <div className="builder-sidebar-inner">
            {/* Add section button */}
            <button
              className="builder-add-btn"
              onClick={() => setShowAddModal(true)}
            >
              <span className="builder-add-icon">＋</span>
              Хуудас нэмэх
            </button>

            {/* Section list */}
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

              {gift.sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`builder-section-item ${selectedSectionId === section.id ? "selected" : ""}`}
                  onClick={() => setSelectedSectionId(section.id)}
                >
                  <div className="builder-section-item-left">
                    <span className="builder-drag-handle">⠿</span>
                    <span className="builder-section-item-icon">
                      {getSectionIcon(section)}
                    </span>
                    <span className="builder-section-item-name">
                      {getSectionLabel(section)}
                    </span>
                  </div>
                  <div className="builder-section-item-actions">
                    <button
                      title="Preview"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSectionPreview(section);
                      }}
                      className="builder-action-btn builder-action-preview"
                    >
                      👁
                    </button>
                    <button
                      title="Дээш"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(section.id, -1);
                      }}
                      disabled={idx === 0}
                      className="builder-action-btn"
                    >
                      ↑
                    </button>
                    <button
                      title="Доош"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(section.id, 1);
                      }}
                      disabled={idx === gift.sections.length - 1}
                      className="builder-action-btn"
                    >
                      ↓
                    </button>
                    <button
                      title="Устгах"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      className="builder-action-btn builder-action-delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar footer */}
          <div className="builder-sidebar-footer">
            <div className="builder-sidebar-info">
              <span className="builder-sidebar-info-count">
                {gift.sections.length}
              </span>
              <span>section нэмэгдсэн</span>
            </div>
          </div>
        </aside>

        {/* ─── MAIN EDITOR AREA ─── */}
        <main className="builder-main">
          {selectedSection ? (
            <div className="builder-editor-panel">
              {/* Editor header */}
              <div className="builder-editor-header">
                <div className="builder-editor-header-left">
                  <span className="builder-editor-icon">
                    {getSectionIcon(selectedSection)}
                  </span>
                  <h2 className="builder-editor-title">
                    {getSectionLabel(selectedSection)}
                  </h2>
                </div>
                <button
                  className="builder-btn builder-btn-preview-sm"
                  onClick={() => openSectionPreview(selectedSection)}
                >
                  <span>👁</span>
                  <span>Preview</span>
                </button>
              </div>

              {/* Editor body */}
              <div className="builder-editor-body">{renderEditor()}</div>
            </div>
          ) : (
            <div className="builder-empty-state">
              <div className="builder-empty-icon">✨</div>
              <h3 className="builder-empty-title">Section сонгоно уу</h3>
              <p className="builder-empty-text">
                Зүүн талын жагсаалтаас section сонгож засварлана уу, эсвэл шинэ
                section нэмнэ үү
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
