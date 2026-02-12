import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { giftToTemplate, SECTION_TYPES } from "../models/gift";
import { SECTION_REGISTRY } from "../sections/sectionRegistry";
import HeartRain from "./HeartRain";
import YouTubeAudioPlayer from "./YouTubeAudioPlayer";

/** Build initial choices state from the stepQuestions section data. */
function buildInitialChoices(gift) {
  const stepSection = gift.sections.find(
    (s) => s.type === SECTION_TYPES.STEP_QUESTIONS,
  );
  if (!stepSection?.data?.steps) return {};
  const init = {};
  stepSection.data.steps.forEach((s) => {
    init[s.key] = s.multiSelect ? [] : null;
  });
  return init;
}

/**
 * GiftRenderer — data-driven renderer for a Gift.
 *
 * Walks through gift.sections in order, rendering each section
 * with the matching component from the section registry.
 *
 * Manages:
 *  - Section navigation (current index, next/back)
 *  - User choices state (for stepQuestions / finalSummary)
 *  - Customizer state (for sparkCustomizer)
 *  - HeartRain visual effect
 */
export default function GiftRenderer({ gift, startDate, category, initialSectionIndex = 0 }) {
  const [sectionIndex, setSectionIndex] = useState(initialSectionIndex || 0);
  const [choices, setChoices] = useState(() => buildInitialChoices(gift));
  const [customizerData, setCustomizerData] = useState({});
  const [heartRain, setHeartRain] = useState(false);

  // ── Persistent music state ──
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const [musicElapsed, setMusicElapsed] = useState(0);
  const musicTimerRef = useRef(null);

  // Reconstruct template-like object so existing components work unchanged
  const template = useMemo(() => giftToTemplate(gift), [gift]);

  // Extract music config from love letter
  const musicConfig = useMemo(() => template.loveLetter?.music || null, [template]);

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

  // Called by LoveLetter when letter is opened
  const startMusic = useCallback(() => {
    if (musicConfig?.url && !musicPlaying) {
      setMusicStarted(true);
      setMusicPlaying(true);
    }
  }, [musicConfig, musicPlaying]);

  const toggleMusic = useCallback(() => {
    if (musicConfig?.url) setMusicStarted(true);
    setMusicPlaying((p) => !p);
  }, [musicConfig?.url]);

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
      const target = gift.sections[index];
      if (target?.type === SECTION_TYPES.MEMORY_GALLERY) {
        setHeartRain(true);
      }
    },
    [gift.sections],
  );

  // respond to external initial section index changes (deep-linking)
  useEffect(() => {
    setSectionIndex(initialSectionIndex || 0);
  }, [initialSectionIndex]);

  const goNext = useCallback(() => {
    const nextIndex = sectionIndex + 1;
    if (nextIndex < gift.sections.length) {
      goToSection(nextIndex);
    }
  }, [sectionIndex, gift.sections.length, goToSection]);

  const goBack = useCallback(() => {
    if (sectionIndex > 0) {
      goToSection(sectionIndex - 1);
    }
  }, [sectionIndex, goToSection]);

  const updateChoice = useCallback((key, val) => {
    setChoices((prev) => ({ ...prev, [key]: val }));
  }, []);

  // ── Render current section ──────────────────────────────────

  const currentSection = gift.sections[sectionIndex];
  if (!currentSection) return null;

  const { type } = currentSection;
  const entry = SECTION_REGISTRY[type];
  if (!entry) return null;

  const Component = entry.component;

  const renderSection = () => {
    switch (type) {
      case SECTION_TYPES.SPARK_CUSTOMIZER:
        return (
          <Component
            value={customizerData}
            onChange={setCustomizerData}
            onContinue={goNext}
            template={template}
          />
        );

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
        return <Component letter={template.loveLetter} onClose={goNext} onMusicStart={startMusic} />;

      case SECTION_TYPES.QUESTION:
        return <Component onYes={goNext} template={template} />;

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
          />
        );

      case SECTION_TYPES.STEP_QUESTIONS:
        return (
          <Component
            steps={template.stepQuestions?.steps || []}
            choices={choices}
            updateChoice={updateChoice}
            onDone={goNext}
            onBack={goBack}
            template={template}
          />
        );

      case SECTION_TYPES.FINAL_SUMMARY:
        return (
          <Component
            choices={choices}
            template={template}
            category={category}
          />
        );

      case SECTION_TYPES.MEMORY_VIDEO:
        return <Component data={currentSection.data} onContinue={goNext} />;

      default:
        return null;
    }
  };

  return (
    <>
      {heartRain && (
        <HeartRain active={heartRain} emojis={template?.effects?.heartRain} />
      )}
      {renderSection()}

      {/* Hidden YouTube audio iframe */}
      {musicConfig?.url && (
        <YouTubeAudioPlayer url={musicConfig.url} playing={musicPlaying} />
      )}

      {/* Persistent bottom music bar */}
      {musicConfig?.url && musicStarted && (
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
                  style={{ width: `${Math.min((musicElapsed / (musicConfig.duration || 240)) * 100, 100)}%` }}
                />
              </div>
              <span className="pmb-time">{formatTime(musicElapsed)}</span>
            </div>
          </div>
          <button
            className="pmb-toggle"
            onClick={(e) => { e.stopPropagation(); toggleMusic(); }}
          >
            {musicPlaying ? "⏸" : "▶️"}
          </button>
        </div>
      )}
    </>
  );
}
