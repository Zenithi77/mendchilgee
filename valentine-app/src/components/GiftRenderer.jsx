import { useState, useCallback, useMemo, useEffect, useRef, Component as ReactComponent } from "react";
import { giftToTemplate, SECTION_TYPES } from "../models/gift";
import { SECTION_REGISTRY } from "../sections/sectionRegistry";
import { saveGiftResponse } from "../services/giftResponseService";
import HeartRain from "./HeartRain";
import YouTubeAudioPlayer from "./YouTubeAudioPlayer";
import GiftCompletePage from "./GiftCompletePage";
import { MdPause, MdPlayArrow } from "react-icons/md";

/* ── ErrorBoundary: catches render crashes in section components ── */
class SectionErrorBoundary extends ReactComponent {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    console.error("[GiftRenderer] Section crashed:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="page page-enter" style={{ textAlign: "center", padding: 40 }}>
          <div className="glass" style={{ padding: 32 }}>
            <p style={{ fontSize: "1.2rem", marginBottom: 16 }}>Алдаа гарлаа 😔</p>
            <button
              className="btn btn-magic"
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onSkip?.();
              }}
            >
              Дараагийнх руу шилжих →
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Build initial choices state. */
function buildInitialChoices() {
  return {};
}

/**
 * GiftRenderer — data-driven renderer for a Gift.
 *
 * Walks through gift.sections in order, rendering each section
 * with the matching component from the section registry.
 *
 * Manages:
 *  - Section navigation (current index, next/back)
 *  - User choices state (for finalSummary)
 *  - HeartRain visual effect
 */
export default function GiftRenderer({
  gift,
  startDate,
  category,
  initialSectionIndex = 0,
  giftId,
  persistResponses = false,
}) {
  // Filter out finalSummary sections — we go straight to GiftCompletePage
  const filteredSections = useMemo(
    () => (gift?.sections || []).filter(s => s.type !== SECTION_TYPES.FINAL_SUMMARY),
    [gift?.sections],
  );
  const filteredGift = useMemo(
    () => ({ ...gift, sections: filteredSections }),
    [gift, filteredSections],
  );

  const [sectionIndex, setSectionIndex] = useState(initialSectionIndex || 0);
  const [prevInitialIndex, setPrevInitialIndex] = useState(
    initialSectionIndex || 0,
  );
  const [choices, setChoices] = useState(() => buildInitialChoices());
  const [heartRain, setHeartRain] = useState(false);
  const [giftComplete, setGiftComplete] = useState(false);

  // Adjust sectionIndex when initialSectionIndex prop changes (deep-linking)
  if ((initialSectionIndex || 0) !== prevInitialIndex) {
    setPrevInitialIndex(initialSectionIndex || 0);
    setSectionIndex(initialSectionIndex || 0);
  }

  // ── Listen for builder postMessage to sync section ──
  useEffect(() => {
    const handler = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'builder-go-to-section') {
        const idx = e.data.index;
        if (typeof idx === 'number' && idx >= 0 && idx < (filteredSections.length)) {
          window.scrollTo({ top: 0, behavior: 'instant' });
          setSectionIndex(idx);
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [filteredSections.length]);

  // ── Persistent music state ──
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const [musicElapsed, setMusicElapsed] = useState(0);
  const musicTimerRef = useRef(null);
  const ytPlayerRef = useRef(null);

  // Reconstruct template-like object so existing components work unchanged
  const template = useMemo(() => giftToTemplate(gift), [gift]);

  // Extract music config from love letter
  const musicConfig = useMemo(
    () => template.loveLetter?.music || null,
    [template],
  );

  // Music elapsed timer
  useEffect(() => {
    if (musicPlaying) {
      musicTimerRef.current = setInterval(() => {
        setMusicElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (musicTimerRef.current) clearInterval(musicTimerRef.current);
    }
    return () => {
      if (musicTimerRef.current) clearInterval(musicTimerRef.current);
    };
  }, [musicPlaying]);

  // Called by LoveLetter when letter is opened.
  // Unlocks iOS audio and directly calls play() on the YT player
  // so that the browser sees it as part of the synchronous
  // user-gesture call stack.
  const startMusic = useCallback(() => {
    // ── iOS audio unlock: play a silent buffer so the OS marks
    //    this page as "user initiated audio" ──
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
      }
    } catch {}
    // Also unlock via a tiny silent <audio> element
    try {
      const a = document.createElement("audio");
      a.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      a.volume = 0.01;
      a.play().catch(() => {});
    } catch {}

    setMusicStarted(true);
    setMusicPlaying(true);
    ytPlayerRef.current?.play();
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicStarted(true);
    setMusicPlaying((p) => !p);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const goToSection = useCallback(
    (index) => {
      window.scrollTo({ top: 0, behavior: "instant" });
      setSectionIndex(index);
      // Activate heart rain when entering memoryGallery
      const target = filteredSections[index];
      if (target?.type === SECTION_TYPES.MEMORY_GALLERY) {
        setHeartRain(true);
      }
      // Auto-pause background music when entering video section
      if (target?.type === SECTION_TYPES.MEMORY_VIDEO) {
        setMusicPlaying(false);
      }
    },
    [filteredSections],
  );

  const goNext = useCallback(() => {
    const nextIndex = sectionIndex + 1;
    if (nextIndex < filteredSections.length) {
      goToSection(nextIndex);
    } else {
      // All sections done → show completion page
      window.scrollTo({ top: 0, behavior: "instant" });
      setMusicPlaying(false);
      setGiftComplete(true);
    }
  }, [sectionIndex, filteredSections.length, goToSection]);

  const goBack = useCallback(() => {
    if (sectionIndex > 0) {
      goToSection(sectionIndex - 1);
    }
  }, [sectionIndex, goToSection]);

  const updateChoice = useCallback((key, val) => {
    setChoices((prev) => ({ ...prev, [key]: val }));
  }, []);

  // ── Auto-save choices when reaching the last section ──
  useEffect(() => {
    if (
      persistResponses &&
      giftId &&
      sectionIndex === filteredSections.length - 1
    ) {
      saveGiftResponse(giftId, choices).catch((err) =>
        console.warn("Failed to save gift response:", err),
      );
    }
  }, [sectionIndex, persistResponses, giftId, choices, filteredSections.length]);

  // ── Auto-complete if sectionIndex is past the end ──
  useEffect(() => {
    if (!giftComplete && sectionIndex >= filteredSections.length) {
      window.scrollTo({ top: 0, behavior: "instant" });
      setMusicPlaying(false);
      setGiftComplete(true);
    }
  }, [sectionIndex, filteredSections.length, giftComplete]);

  // ── Auto-skip unknown section types ──
  const currentSection = filteredSections[sectionIndex];
  const currentType = currentSection?.type;
  const currentEntry = currentType ? SECTION_REGISTRY[currentType] : null;

  useEffect(() => {
    if (giftComplete) return;
    // Unknown section type — skip it
    if (currentSection && !currentEntry) {
      const nextIdx = sectionIndex + 1;
      if (nextIdx < filteredSections.length) {
        goToSection(nextIdx);
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
        setMusicPlaying(false);
        setGiftComplete(true);
      }
    }
  }, [sectionIndex, currentSection, currentEntry, giftComplete, filteredSections.length, goToSection]);

  // Debug: log what section we're on
  useEffect(() => {
    console.log(`[GiftRenderer] section ${sectionIndex}/${filteredSections.length}`, {
      type: currentSection?.type,
      hasEntry: !!currentEntry,
      dataKeys: currentSection?.data ? Object.keys(currentSection.data) : [],
      giftComplete,
    });
  }, [sectionIndex, currentSection, currentEntry, filteredSections.length, giftComplete]);

  // ── Render current section ──────────────────────────────────

  // Show gift completion page when all sections are done
  if (giftComplete) {
    return <GiftCompletePage category={category} />;
  }

  if (!currentSection || !currentEntry) return null;

  const { type } = currentSection;
  const entry = currentEntry;

  const Component = entry.component;

  const renderSection = () => {
    switch (type) {
      case SECTION_TYPES.WELCOME:
        return (
          <Component
            startDate={startDate}
            onOpen={goNext}
            template={template}
            category={category}
          />
        );

      case SECTION_TYPES.LOVE_LETTER:
        return (
          <Component
            letter={template.loveLetter}
            onClose={goNext}
            onMusicStart={startMusic}
            category={category}
          />
        );

      case SECTION_TYPES.QUESTION:
        return <Component onYes={goNext} template={template} category={category} />;

      case SECTION_TYPES.MOVIE_SELECTION:
        return (
          <Component
            onContinue={goNext}
            template={template}
            selectedMovie={choices.movie}
            onSelectMovie={(title) => updateChoice("movie", title)}
          />
        );

      case SECTION_TYPES.MEMORY_GALLERY:
        return (
          <Component
            memories={template.memoryGallery?.memories || []}
            onContinue={goNext}
            template={template}
            category={category}
            musicPlaying={musicPlaying}
            onMusicPause={() => setMusicPlaying(false)}
          />
        );

      case SECTION_TYPES.FINAL_SUMMARY:
        return (
          <Component
            choices={choices}
            template={template}
            category={category}
            onContinue={goNext}
          />
        );

      case SECTION_TYPES.MEMORY_VIDEO:
        return (
          <Component
            data={currentSection.data}
            onContinue={goNext}
            onMusicPause={() => setMusicPlaying(false)}
          />
        );

      case SECTION_TYPES.FUN_QUESTIONS:
        return <Component data={currentSection.data} onContinue={goNext} />;

      case SECTION_TYPES.SPECIAL_QUESTIONS:
        return <Component data={currentSection.data} onContinue={goNext} category={category} />;

      case SECTION_TYPES.SIMPLE_QUESTIONS:
        return (
          <Component
            data={currentSection.data}
            onContinue={goNext}
            category={category}
            onAnswersSubmit={(pairs) => {
              const key = `simpleQuestions_${sectionIndex}`;
              updateChoice(key, pairs);
              if (persistResponses && giftId) {
                const updated = { ...choices, [key]: pairs };
                saveGiftResponse(giftId, updated).catch((err) =>
                  console.warn("Failed to save SimpleQuestions answers:", err),
                );
              }
            }}
          />
        );

      case SECTION_TYPES.STEP_QUESTIONS:
        return (
          <Component
            steps={currentSection.data?.steps || []}
            choices={choices}
            updateChoice={updateChoice}
            onDone={goNext}
            onBack={goBack}
            template={template}
            category={category}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {heartRain && (
        <HeartRain active={heartRain} emojis={template?.effects?.heartRain} />
      )}
      <SectionErrorBoundary key={sectionIndex} onSkip={goNext}>
        {renderSection()}
      </SectionErrorBoundary>

      {/* Hidden YouTube audio iframe */}
      {musicConfig?.url && (
        <YouTubeAudioPlayer
          ref={ytPlayerRef}
          url={musicConfig.url}
          playing={musicPlaying}
          startTime={musicConfig.startTime || 0}
          clipDuration={musicConfig.clipDuration || 0}
        />
      )}

      {/* Persistent bottom music bar — hide during video section */}
      {musicConfig?.url && musicStarted && type !== SECTION_TYPES.MEMORY_VIDEO && (
        <div
          className={`persistent-music-bar ${musicPlaying ? "playing" : "paused"}`}
          onClick={toggleMusic}
        >
          <div className="pmb-eq">
            <span className="pmb-eq-bar" />
            <span className="pmb-eq-bar" />
            <span className="pmb-eq-bar" />
            <span className="pmb-eq-bar" />
          </div>
          <div className="pmb-info">
            <div className="pmb-title">{musicConfig.title || "🎵 Music"}</div>
            <div className="pmb-timeline">
              <div className="pmb-progress-bar">
                <div
                  className="pmb-progress-fill"
                  style={{
                    width: `${Math.min((musicElapsed / (musicConfig.clipDuration || musicConfig.duration || 240)) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="pmb-time">{formatTime(musicElapsed)}</span>
            </div>
          </div>
          <button
            className="pmb-toggle"
            onClick={(e) => {
              e.stopPropagation();
              toggleMusic();
            }}
          >
            {musicPlaying ? <MdPause /> : <MdPlayArrow />}
          </button>
        </div>
      )}
    </>
  );
}
