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
import PurchaseModal from "./PurchaseModal";
import GiftCompletionModal from "./GiftCompletionModal";
import PreviewModal from "./PreviewModal";
import { TEMPLATES } from "../templateConfigs";
import { TIER_META } from "../config/tiers";
import { FEATURE_REGISTRY } from "../config/featureRegistry";
import {
  getRequiredTier,
  needsUpgrade,
  getRemainingDays,
} from "../utils/tierUtils";
import { IoClose, IoColorPalette } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { MdDelete, MdSave, MdRefresh, MdVisibility, MdEdit, MdWarning, MdAutoAwesome, MdCheck, MdClose, MdDescription, MdPlaylistAdd, MdHourglassEmpty, MdCelebration, MdMail, MdPhotoCamera, MdMovie, MdVideocam, MdChecklist, MdAdd, MdChevronLeft, MdChevronRight } from "react-icons/md";
import {
  IoMdPhonePortrait,
  IoIosTabletLandscape,
  IoMdDesktop,
} from "react-icons/io";

import {
  WelcomeLetterEditor,
  MovieSelectionEditor,
  MemoryGalleryEditor,
  MemoryVideoEditor,
  FunQuestionsEditor,
  GenericEditor,
  SimpleQuestionsEditor,
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
    // Filter out deprecated finalSummary sections
    if (g?.sections) {
      g.sections = g.sections.filter(s => s.type !== SECTION_TYPES.FINAL_SUMMARY);
    }
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
          // Filter out deprecated finalSummary sections
          if (data.sections) {
            data.sections = data.sections.filter(s => s.type !== SECTION_TYPES.FINAL_SUMMARY);
          }
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
  const [pendingFocusSectionId, setPendingFocusSectionId] = useState(null);

  // ── Mobile tab mode ──
  const [mobileTab, setMobileTab] = useState('edit'); // 'preview' | 'edit'

  // ── Desktop preview mode ──
  const [desktopPreviewMode, setDesktopPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [desktopPreviewReloadKey, setDesktopPreviewReloadKey] = useState(0);
  const desktopScreenRef = useRef(null);
  const desktopIframeRef = useRef(null);
  const [desktopIframeScale, setDesktopIframeScale] = useState(1);
  const [desktopIframeHeight, setDesktopIframeHeight] = useState(900);

  // ── Phone iframe scale (mobile preview) ──
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
        const s = w / 430;
        setIframeScale(s);
        setIframeHeight(Math.ceil(h / s));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [gift?.id]);

  // Desktop preview iframe scaling
  useEffect(() => {
    const el = desktopScreenRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        const renderWidth = desktopPreviewMode === 'mobile' ? 430 : 1200;
        const s = w / renderWidth;
        setDesktopIframeScale(s);
        setDesktopIframeHeight(Math.ceil(h / s));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [gift?.id, desktopPreviewMode]);

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

  // ── Sync desktop preview iframe with active slide ──
  useEffect(() => {
    const iframe = desktopIframeRef.current;
    if (!iframe?.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        { type: 'builder-go-to-section', index: activeSlideIndex },
        window.location.origin,
      );
    } catch {}
  }, [activeSlideIndex]);

  // ── Send gift data to preview iframes via postMessage ──
  const sendGiftToPreview = useCallback(() => {
    const msg = { type: 'builder-preview-data', gift };
    try {
      desktopIframeRef.current?.contentWindow?.postMessage(msg, window.location.origin);
    } catch {}
    // Also send to mobile iframe
    const mobileIframe = document.querySelector('.builder-phone-iframe');
    try {
      mobileIframe?.contentWindow?.postMessage(msg, window.location.origin);
    } catch {}
  }, [gift]);

  // Send gift data whenever gift changes
  useEffect(() => {
    sendGiftToPreview();
  }, [sendGiftToPreview]);

  // Listen for preview-ready messages from iframes
  useEffect(() => {
    const handler = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'builder-preview-ready') {
        sendGiftToPreview();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [sendGiftToPreview]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showFullPreviewModal, setShowFullPreviewModal] = useState(false);

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
    // Only allow saving if gift already exists in Firestore (has an id)
    if (!gift.id) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
      return null;
    }
    try {
      setSaving(true);
      setSaveStatus(null);
      // Compute and persist requiredTier before saving
      const tierToSave = getRequiredTier(gift.sections);
      // Never downgrade an activated gift back to "draft"
      const isActivated = gift.creditUsed === true || (gift.paidTier && gift.paidTier !== "free");
      const statusToSave = isActivated ? "published" : (gift.status || "draft");
      const giftToSave = { ...gift, requiredTier: tierToSave, status: statusToSave };
      const docId = await saveOrUpdateGift(giftToSave, user.uid);
      setGift((prev) => ({ ...prev, id: docId, requiredTier: tierToSave, status: statusToSave }));
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

  // ── Export save: used by GiftCompletionModal to save new gifts (requires credit) ──
  const handleExportSave = useCallback(async () => {
    if (!user || !gift) return null;
    try {
      setSaving(true);
      setSaveStatus(null);
      const tierToSave = getRequiredTier(gift.sections);
      // Never downgrade an activated gift back to "draft"
      const isActivated = gift.creditUsed === true || (gift.paidTier && gift.paidTier !== "free");
      const statusToSave = isActivated ? "published" : (gift.status || "draft");
      const giftToSave = { ...gift, requiredTier: tierToSave, status: statusToSave };
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
      console.error("Export save error:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
      return null;
    } finally {
      setSaving(false);
    }
  }, [gift, user, urlGiftId, navigate]);

  // Close editor from the warning modal (changes already in local state)
  const saveAndCloseEditor = useCallback(() => {
    setShowUnsavedWarning(false);
    setSelectedSectionId(null);
    setSectionSnapshot(null);
  }, []);

  const openFullPreview = useCallback(() => {
    setShowFullPreviewModal(true);
  }, []);



  // ── Finish gift creation → show completion modal (NO SAVE yet) ──
  const handleFinish = useCallback(() => {
    if (!gift || gift.sections.length === 0) return;
    setShowCompletionModal(true);
  }, [gift]);

  const getSectionLabel = (section) => {
    const reg = SECTION_REGISTRY[section.type];
    return reg ? reg.labelMn || reg.label : section.type;
  };

  const getSectionIcon = (section) => {
    const reg = SECTION_REGISTRY[section.type];
    return reg ? reg.icon : <MdDescription />;
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

    if (type === SECTION_TYPES.MEMORY_VIDEO)
      return (
        <MemoryVideoEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );

    if (type === SECTION_TYPES.FUN_QUESTIONS)
      return (
        <FunQuestionsEditor
          section={selectedSection}
          onUpdate={updateSectionData}
        />
      );

    if (type === SECTION_TYPES.SIMPLE_QUESTIONS)
      return (
        <SimpleQuestionsEditor
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
        <div style={{ textAlign: "center" }}>
          <div className="loader-ring" style={{ margin: '0 auto 1rem' }} />
          <span className="loader-text">Уншиж байна</span>
        </div>
      </div>
    );
  }

  const isMilitary = gift?.category === "soldiers-day";

  return (
    <div className={`builder${isMilitary ? " builder-military" : ""}`}>
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
        onPurchase={() => setShowPurchaseModal(true)}
        onActivated={async () => {
          // Reload gift to get updated paidTier
          if (gift.id) {
            try {
              const updated = await getGift(gift.id);
              if (updated) setGift(updated);
            } catch {}
          }
        }}
      />

      <PurchaseModal
        open={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={() => {}}
      />

      <GiftCompletionModal
        open={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        gift={gift}
        onSaveGift={handleExportSave}
        onPurchase={() => {
          setShowCompletionModal(false);
          setShowPurchaseModal(true);
        }}
        onGiftReload={async (activatedGiftId) => {
          // Use explicit giftId to avoid stale closure when gift.id
          // hasn't been updated in local state yet (new gift activation)
          const id = activatedGiftId || gift?.id;
          if (id) {
            try {
              const updated = await getGift(id);
              if (updated) {
                if (!updated.theme?.className) updated.theme = { ...DEFAULT_BUILDER_THEME };
                if (!updated.effects?.floatingHearts) updated.effects = { ...DEFAULT_EFFECTS };
                setGift(updated);
              }
            } catch (err) {
              console.error("Gift reload failed:", err);
            }
          }
        }}
      />

      {/* Full Preview Modal */}
      <PreviewModal
        open={showFullPreviewModal}
        onClose={() => setShowFullPreviewModal(false)}
        gift={gift}
        mode="full"
        startDate={gift.startDate}
        category={gift.category}
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
        </div>

        <div className="builder-header-right">
          <button
            className="builder-btn builder-btn-outline builder-btn-preview"
            onClick={openFullPreview}
            disabled={gift.sections.length === 0}
          >
            <span className="builder-btn-icon"><MdVisibility /></span>
            <span className="builder-btn-preview-txt">Урьдчилан харах</span>
          </button>

          <button
            className="builder-btn builder-btn-save-header"
            onClick={handleSave}
            disabled={saving || gift.sections.length === 0 || !gift.id}
            title={!gift.id ? 'Export хийсний дараа save ашиглах боломжтой' : 'Өөрчлөлтийг хадгалах'}
          >
            <MdSave />
            <span className="builder-btn-save-txt">{saving ? 'Хадгалж...' : 'Save'}</span>
          </button>
          {saveStatus === 'saved' && <span className="builder-save-badge builder-save-ok">✓</span>}
          {saveStatus === 'error' && <span className="builder-save-badge builder-save-err">✗</span>}

          <button
            className="builder-btn builder-btn-export"
            onClick={handleFinish}
            disabled={saving || gift.sections.length === 0}
          >
            <MdCelebration />
            <span className="builder-btn-export-txt">{saving ? 'Хадгалж байна...' : 'Export'}</span>
          </button>
        </div>
      </header>

      <div className={`builder-body ${mobileTab === 'preview' ? 'mobile-preview-active' : ''}`}>
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

            {/* Section editors */}
              <>
                {/* Add + Save buttons */}
                <button
                  className="builder-add-btn"
                  onClick={() => setShowAddModal(true)}
                  type="button"
                >
                  <span className="builder-add-icon"><MdAdd /></span>
                  Хуудас нэмэх
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
                        <MdChevronLeft />
                      </button>
                      {/* Navigate to next section */}
                      <button
                        type="button"
                        className="builder-action-btn builder-action-nav"
                        onClick={() => goToSlide(activeSlideIndex + 1)}
                        disabled={activeSlideIndex >= gift.sections.length - 1}
                        title="Дараагийн хуудас"
                      >
                        <MdChevronRight />
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
                    <span className="builder-section-empty-icon"><MdPlaylistAdd /></span>
                    <p>Section нэмэгдээгүй байна</p>
                    <p className="builder-section-empty-hint">
                      Дээрх товч дарж section нэмнэ үү
                    </p>
                  </div>
                ) : null}

              </>
          </div>


        </aside>

        {/* ═══ MOBILE: Phone Mockup Preview (shown when mobileTab === 'preview') ═══ */}
        <div className={`builder-phone-preview-panel ${mobileTab === 'preview' ? 'active' : ''}`}>
            <div className="builder-phone-frame">
              <div className="builder-phone-notch" />
              <div className="builder-phone-screen" ref={phoneScreenRef}>
                <iframe
                  key={previewReloadKey}
                  className="builder-phone-iframe"
                  src="/preview"
                  title="Урьдчилан харах"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  style={{ transform: `scale(${iframeScale})`, width: '430px', height: `${iframeHeight}px` }}
                />
              </div>
              <div className="builder-phone-home-bar" />
            </div>
          </div>

        {/* ═══ RIGHT PANEL: Real Preview (desktop) ═══ */}
        <main className="builder-main builder-slides-main">
          {/* Desktop/Mobile toggle */}
          <div className="builder-desktop-preview-toggle">
            <button
              type="button"
              className={`builder-dpt-btn ${desktopPreviewMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setDesktopPreviewMode('desktop')}
            >
              <IoMdDesktop /> Desktop
            </button>
            <button
              type="button"
              className={`builder-dpt-btn ${desktopPreviewMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setDesktopPreviewMode('mobile')}
            >
              <IoMdPhonePortrait /> Mobile
            </button>
            <button
              type="button"
              className="builder-dpt-btn builder-dpt-reload"
              onClick={() => setDesktopPreviewReloadKey(k => k + 1)}
              title="Шинэчлэх"
            >
              <MdRefresh />
            </button>
          </div>

          {/* Real iframe preview — single persistent iframe, no destruction on mode switch */}
            <div className={`builder-desktop-preview-wrap ${desktopPreviewMode === 'mobile' ? 'mobile-mode' : 'desktop-mode'}`}>
              <div className="builder-desktop-phone-frame">
                <div className="builder-desktop-phone-notch" />
                <div className="builder-desktop-phone-screen" ref={desktopScreenRef}>
                  <iframe
                    ref={desktopIframeRef}
                    key={`desktop-preview-${desktopPreviewReloadKey}`}
                    className="builder-desktop-iframe"
                    src="/preview"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    style={{
                      transform: `scale(${desktopIframeScale})`,
                      width: desktopPreviewMode === 'mobile' ? '430px' : '1200px',
                      height: `${desktopIframeHeight}px`,
                    }}
                  />
                </div>
                <div className="builder-desktop-phone-home-bar" />
              </div>
            </div>
        </main>

        {/* ✅ Mobile bottom action bar — tab-based */}
        <div className="builder-mobile-bar">
          {mobileTab === 'edit' ? (
            <>
              <button
                type="button"
                className="builder-mobile-bar-btn"
                onClick={() => goToSlide(activeSlideIndex - 1)}
                disabled={activeSlideIndex <= 0}
              >
                <span><MdChevronLeft /></span>
                <span>Өмнөх</span>
              </button>
              <button
                type="button"
                className="builder-mobile-bar-btn builder-mobile-bar-add"
                onClick={() => setShowAddModal(true)}
              >
                <span className="builder-mobile-bar-plus"><MdAdd /></span>
              </button>
              <button
                type="button"
                className="builder-mobile-bar-btn"
                onClick={() => goToSlide(activeSlideIndex + 1)}
                disabled={activeSlideIndex >= gift.sections.length - 1}
              >
                <span><MdChevronRight /></span>
                <span>Дараах</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="builder-mobile-bar-btn"
                onClick={() => setPreviewReloadKey((k) => k + 1)}
              >
                <span><MdRefresh /></span>
                <span>Шинэчлэх</span>
              </button>
            </>
          )}

          {/* ── Tab toggle (always visible) ── */}
          <button
            type="button"
            className={`builder-mobile-bar-tab-toggle ${mobileTab === 'preview' ? 'preview-active' : 'edit-active'}`}
            onClick={() => {
              setMobileTab(prev => {
                const next = prev === 'edit' ? 'preview' : 'edit';
                if (next === 'preview') setPreviewReloadKey(k => k + 1);
                return next;
              });
            }}
          >
            <span>{mobileTab === 'edit' ? <MdVisibility /> : <MdEdit />}</span>
            <span>{mobileTab === 'edit' ? 'Харах' : 'Засах'}</span>
          </button>
        </div>

        {/* ✅ Unsaved-changes warning modal */}
        {showUnsavedWarning && (
          <>
            <div className="builder-unsaved-overlay" />
            <div className="builder-unsaved-modal">
              <div className="builder-unsaved-icon"><MdWarning /></div>
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
                  {saving ? "Хадгалж байна..." : <><MdSave /> Хадгалах</>}
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
