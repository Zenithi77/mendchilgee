import { useState, useEffect, useRef, useCallback } from "react";
import { MdClose, MdCloudUpload, MdPhotoCamera, MdVideocam, MdCelebration, MdMail, MdMusicNote, MdFavorite, MdMovie, MdSettings, MdAutoAwesome, MdStar, MdPlayArrow, MdPause, MdQuestionAnswer, MdChat, MdArrowUpward, MdArrowDownward, MdDelete } from "react-icons/md";
import { SECTION_TYPES } from "../models/gift";
import {
  uploadMemoryPhoto,
  uploadMemoryVideo,
} from "../services/cloudinaryService";
import { useAuth } from "../contexts/AuthContext";
import { getSectionLimits } from "../config/featureRegistry";
import { TIERS, TIER_META } from "../config/tiers";
import { EXTRA_IMAGE_PRICE, EXTRA_VIDEO_PRICE, VIDEO_CHUNK_SECONDS } from "../config/plans";
import { ensureYTApi, parseYouTubeId } from "../utils/youtube";
import "./SectionEditors.css";

// ═══════════════════════════════════════════════════════════════
// Shared helpers
// ═══════════════════════════════════════════════════════════════

function FieldRow({ label, children }) {
  return (
    <div className="se-field">
      <div className="se-label">{label}</div>
      <div className="se-field-input">{children}</div>
    </div>
  );
}

function TextInputWithEmoji({
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 4,
}) {
  return (
    <div className="se-input-with-emoji">
      {multiline ? (
        <textarea
          className="se-textarea"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          className="se-input"
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Music Trimmer — pick a 30s clip from a YouTube track
// ═══════════════════════════════════════════════════════════════

const CLIP_DURATION = 30; // seconds

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function MusicTrimmer({ music, onChange }) {
  const [totalDur, setTotalDur] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const playerRef = useRef(null);
  const boxRef = useRef(null);
  const clipTimerRef = useRef(null);
  const videoId = parseYouTubeId(music?.url);
  const startTime = music?.startTime || 0;

  // Create a hidden player to detect total duration
  useEffect(() => {
    if (!videoId) { setTotalDur(0); return; }
    setLoading(true);
    let destroyed = false;

    ensureYTApi().then(() => {
      if (destroyed) return;

      // Destroy previous player
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }

      const el = document.createElement("div");
      boxRef.current?.appendChild(el);

      playerRef.current = new window.YT.Player(el, {
        videoId,
        height: "0",
        width: "0",
        playerVars: { autoplay: 0, controls: 0 },
        events: {
          onReady: (e) => {
            if (destroyed) return;
            const d = e.target.getDuration();
            setTotalDur(d || 0);
            setLoading(false);
          },
          onError: () => {
            setLoading(false);
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const maxStart = Math.max(0, Math.floor(totalDur - CLIP_DURATION));

  const togglePreview = () => {
    if (!playerRef.current) return;
    if (previewing) {
      playerRef.current.pauseVideo();
      if (clipTimerRef.current) clearTimeout(clipTimerRef.current);
      setPreviewing(false);
    } else {
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();
      clipTimerRef.current = setTimeout(() => {
        playerRef.current?.pauseVideo();
        setPreviewing(false);
      }, CLIP_DURATION * 1000);
      setPreviewing(true);
    }
  };

  // Cleanup timer
  useEffect(() => () => {
    if (clipTimerRef.current) clearTimeout(clipTimerRef.current);
  }, []);

  if (!videoId) return null;

  return (
    <div className="music-trimmer">
      <div ref={boxRef} style={{ display: "none" }} />

      {loading && (
        <div className="trim-loading">
          <span className="trim-spinner" /> Дууг ачаалж байна...
        </div>
      )}

      {totalDur > 0 && (
        <>
          <div className="trim-info">
            <span className="trim-tag">✂️ {CLIP_DURATION}с хэсэг сонгох</span>
            <span className="trim-range">
              {fmtTime(startTime)} — {fmtTime(startTime + CLIP_DURATION)}
            </span>
          </div>

          <div className="trim-slider-wrap">
            {/* Filled portion indicator */}
            <div
              className="trim-slider-fill"
              style={{
                left: `${(startTime / totalDur) * 100}%`,
                width: `${(CLIP_DURATION / totalDur) * 100}%`,
              }}
            />
            <input
              type="range"
              className="trim-slider"
              min={0}
              max={maxStart}
              step={1}
              value={startTime}
              onChange={(e) => {
                const v = Number(e.target.value);
                onChange({
                  ...music,
                  startTime: v,
                  clipDuration: CLIP_DURATION,
                });
              }}
            />
            <div className="trim-labels">
              <span>0:00</span>
              <span>{fmtTime(totalDur)}</span>
            </div>
          </div>

          <button
            type="button"
            className="trim-preview-btn"
            onClick={togglePreview}
          >
            {previewing ? <><MdPause /> Зогсоох</> : <><MdPlayArrow /> Сонсох</>}
          </button>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Image Uploader — uploads to Cloudinary CDN
// ═══════════════════════════════════════════════════════════════

function ImageUploader({ src, onUploaded }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setUploading(true);
      setProgress(0);
      const url = await uploadMemoryPhoto(file, user.uid, (p) => setProgress(p));
      onUploaded(url);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="se-image-uploader">
      {src ? (
        <div className="se-image-preview">
          <img src={src} alt="" className="se-image-thumb" />
          <button
            type="button"
            className="se-image-remove"
            onClick={() => onUploaded("")}
            title="Устгах"
          >
            <MdClose />
          </button>
        </div>
      ) : (
        <label className="se-image-upload-label">
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: "none" }}
            disabled={uploading}
          />
          {uploading ? (
            <span className="se-upload-progress"><MdCloudUpload /> Хуулж байна...</span>
          ) : (
            <span className="se-upload-text"><MdPhotoCamera /> Зураг сонгох</span>
          )}
        </label>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Video Uploader — uploads video to Cloudinary CDN
// ═══════════════════════════════════════════════════════════════

function VideoUploader({ src, onUploaded }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const MAX_DURATION = 60; // seconds (1 minute max)

  const checkDuration = (file) =>
    new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const dur = Math.round(video.duration);
        URL.revokeObjectURL(video.src);
        if (video.duration > MAX_DURATION) {
          reject(new Error(`Бичлэг хамгийн ихдээ ${MAX_DURATION} секунд байна. (${dur}с)`));
        } else {
          resolve(dur);
        }
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve(0); // can't check — let upload proceed
      };
      video.src = URL.createObjectURL(file);
    });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setError(null);
    try {
      const duration = await checkDuration(file);
      setUploading(true);
      setProgress(0);
      const url = await uploadMemoryVideo(file, user.uid, (p) => setProgress(p));
      onUploaded(url, duration);
    } catch (err) {
      if (err.message.includes("секунд")) {
        setError(err.message);
      } else {
        console.error("Video upload error:", err);
      }
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = "";
    }
  };

  return (
    <div className="se-image-uploader">
      {src ? (
        <div className="se-image-preview">
          <video
            src={src}
            className="se-image-thumb"
            style={{ objectFit: "contain" }}
          />
          <button
            type="button"
            className="se-image-remove"
            onClick={() => onUploaded("")}
            title="Устгах"
          >
            <MdClose />
          </button>
        </div>
      ) : (
        <label className="se-image-upload-label">
          <input
            type="file"
            accept="video/*"
            onChange={handleFile}
            style={{ display: "none" }}
            disabled={uploading}
          />
          {uploading ? (
            <span className="se-upload-progress">
              <MdCloudUpload /> Хуулж байна... {progress > 0 && `${progress}%`}
            </span>
          ) : (
            <span className="se-upload-text"><MdVideocam /> Бичлэг сонгох (30с хүртэл)</span>
          )}
        </label>
      )}
      {error && (
        <div style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 6, fontWeight: 600 }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WELCOME + LOVE LETTER EDITOR (combined)
// ═══════════════════════════════════════════════════════════════

export function WelcomeLetterEditor({
  welcomeSection,
  letterSection,
  onUpdate,
}) {
  const wd = welcomeSection?.data || {};
  const ld = letterSection?.data || {};

  const updateWelcome = (key, value) => {
    if (!welcomeSection) return;
    onUpdate(welcomeSection.id, { ...wd, [key]: value });
  };

  const updateLetter = (key, value) => {
    if (!letterSection) return;
    onUpdate(letterSection.id, { ...ld, [key]: value });
  };

  return (
    <div className="se-editor">
      {/* Welcome fields */}
      {welcomeSection && (
        <div className="se-group">
          <h3 className="se-group-title"><MdCelebration /> Нүүр хэсэг (Welcome)</h3>

          <FieldRow label="Гарчиг">
            <TextInputWithEmoji
              value={wd.title}
              onChange={(v) => updateWelcome("title", v)}
              placeholder="Мэндчилгээ"
            />
          </FieldRow>

          <FieldRow label="Дэд гарчиг">
            <TextInputWithEmoji
              value={wd.subtitle}
              onChange={(v) => updateWelcome("subtitle", v)}
              placeholder="Тусгай мэндчилгээ"
              multiline
            />
          </FieldRow>

          <FieldRow label="Товчлуурын текст">
            <TextInputWithEmoji
              value={wd.buttonText}
              onChange={(v) => updateWelcome("buttonText", v)}
              placeholder="Мэндчилгээ нээх"
            />
          </FieldRow>
        </div>
      )}

      {/* Love Letter fields */}
      {letterSection && (
        <div className="se-group">
          <h3 className="se-group-title"><MdMail /> Захидал хэсэг (Love Letter)</h3>

          <FieldRow label="Гарчиг">
            <TextInputWithEmoji
              value={ld.title}
              onChange={(v) => updateLetter("title", v)}
              placeholder="Миний зүрхний захидал"
            />
          </FieldRow>

          <FieldRow label="Захидлын агуулга">
            <TextInputWithEmoji
              value={ld.content}
              onChange={(v) => updateLetter("content", v)}
              placeholder="Энд хайрын захидлаа бичнэ үү..."
              multiline
              rows={8}
            />
          </FieldRow>

          <FieldRow label={<><MdMusicNote /> Дуу (YouTube URL)</>}>
            <input
              className="se-input"
              type="text"
              value={ld.music?.url || ""}
              onChange={(e) =>
                updateLetter("music", {
                  ...(ld.music || {}),
                  url: e.target.value,
                  title: ld.music?.title || "🎵 Romantic Music",
                  duration: ld.music?.duration || 240,
                })
              }
              placeholder="https://youtu.be/... эсвэл YouTube линк"
            />
          </FieldRow>

          <FieldRow label={<><MdMusicNote /> Дууны нэр</>}>
            <input
              className="se-input"
              type="text"
              value={ld.music?.title || ""}
              onChange={(e) =>
                updateLetter("music", {
                  ...(ld.music || {}),
                  title: e.target.value,
                })
              }
              placeholder="Romantic Music"
            />
          </FieldRow>

          {/* Music trimmer */}
          {ld.music?.url && (
            <MusicTrimmer
              music={ld.music}
              onChange={(updated) => updateLetter("music", updated)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUESTION EDITOR
// ═══════════════════════════════════════════════════════════════

export function QuestionEditor({ section, onUpdate }) {
  const data = section?.data || {};
  const noBtn = data.noButton || {};
  const messages = noBtn.messages || [];
  const variantsEnabled = noBtn.variantsEnabled ?? true;
  const [newMsg, setNewMsg] = useState("");

  const update = (key, value) => {
    onUpdate(section.id, { ...data, [key]: value });
  };

  const updateNoButton = (key, value) => {
    onUpdate(section.id, {
      ...data,
      noButton: { ...noBtn, [key]: value },
    });
  };

  const addMessage = () => {
    const trimmed = newMsg.trim();
    if (!trimmed) return;
    updateNoButton("messages", [...messages, trimmed]);
    setNewMsg("");
  };

  const removeMessage = (idx) => {
    updateNoButton(
      "messages",
      messages.filter((_, i) => i !== idx),
    );
  };

  const editMessage = (idx, value) => {
    const updated = [...messages];
    updated[idx] = value;
    updateNoButton("messages", updated);
  };

  return (
    <div className="se-editor">
      <div className="se-group">
        <h3 className="se-group-title"><MdFavorite /> Асуулга хэсэг</h3>

        <FieldRow label="Асуултын текст">
          <TextInputWithEmoji
            value={data.text}
            onChange={(v) => update("text", v)}
            placeholder="Та надад санагдах уу?"
          />
        </FieldRow>

        <FieldRow
          label={
            <div className="se-label-row">
              <span>'Үгүй' товч - текст хувилбарууд</span>
              <label className="se-toggle se-toggle-inline">
                <input
                  type="checkbox"
                  checked={variantsEnabled}
                  onChange={(e) =>
                    updateNoButton("variantsEnabled", e.target.checked)
                  }
                />
                <span className="se-toggle-slider" />
                <span className="se-toggle-label">
                  {variantsEnabled ? "ON" : "OFF"}
                </span>
              </label>
            </div>
          }
        >
          {variantsEnabled ? (
            <div className="se-list">
              {messages.map((msg, idx) => (
                <div key={idx} className="se-list-item">
                  <div className="se-input-with-emoji" style={{ flex: 1 }}>
                    <input
                      className="se-input"
                      type="text"
                      value={msg}
                      onChange={(e) => editMessage(idx, e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="se-remove-btn"
                    onClick={() => removeMessage(idx)}
                    title="Устгах"
                  >
                    <MdClose />
                  </button>
                </div>
              ))}

              <div className="se-list-add">
                <div className="se-input-with-emoji" style={{ flex: 1 }}>
                  <input
                    className="se-input"
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Шинэ текст нэмэх..."
                    onKeyDown={(e) => e.key === "Enter" && addMessage()}
                  />
                </div>
                <button
                  type="button"
                  className="se-add-btn"
                  onClick={addMessage}
                >
                  ＋
                </button>
              </div>
            </div>
          ) : (
            <p className="se-hint">
              Toggle OFF үед “Үгүй” товч энгийн (хувилбар текстгүй) байна.
            </p>
          )}
        </FieldRow>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEMORY GALLERY EDITOR
// ═══════════════════════════════════════════════════════════════

export function MemoryGalleryEditor({ section, onUpdate, maxImages }) {
  const data = section?.data || {};
  const memories = data.memories || [];

  // maxImages prop from Builder (reasonable cap, default 20)
  const effectiveMax = maxImages || 20;
  const isAtMax = memories.length >= effectiveMax;
  const hasImages = memories.filter(m => m.src).length > 0;

  const updateMemories = (updated) => {
    onUpdate(section.id, { ...data, memories: updated });
  };

  const addMemory = () => {
    if (isAtMax) return; // Hard cap at plan limit
    updateMemories([
      ...memories,
      {
        type: "image",
        src: "",
        placeholder: "📸",
        date: "",
        caption: "",
      },
    ]);
  };

  const removeMemory = (idx) => {
    updateMemories(memories.filter((_, i) => i !== idx));
  };

  const editMemory = (idx, key, value) => {
    const updated = [...memories];
    updated[idx] = { ...updated[idx], [key]: value };
    updateMemories(updated);
  };

  return (
    <div className="se-editor">
      <div className="se-group">
        <h3 className="se-group-title"><MdPhotoCamera /> Зургийн цомог</h3>

        <FieldRow label="Гарчиг">
          <TextInputWithEmoji
            value={data.headerTitle || ""}
            onChange={(v) => onUpdate(section.id, { ...data, headerTitle: v })}
            placeholder="Бидний дурсамжууд"
          />
        </FieldRow>

        <div className="se-cards">
          {memories.map((mem, idx) => (
            <div key={idx} className="se-card">
              <div className="se-card-header">
                <span className="se-card-number">#{idx + 1}</span>
                <button
                  type="button"
                  className="se-remove-btn"
                  onClick={() => removeMemory(idx)}
                  title="Устгах"
                >
                  <MdClose />
                </button>
              </div>

              <FieldRow label="Зураг оруулах">
                <ImageUploader
                  src={mem.src}
                  onUploaded={(url) => editMemory(idx, "src", url)}
                />
              </FieldRow>

              <FieldRow label="Огноо">
                <TextInputWithEmoji
                  value={mem.date || ""}
                  onChange={(v) => editMemory(idx, "date", v)}
                  placeholder="2024.03.15"
                />
              </FieldRow>

              <FieldRow label="Тайлбар">
                <TextInputWithEmoji
                  value={mem.caption || ""}
                  onChange={(v) => editMemory(idx, "caption", v)}
                  placeholder="Анхны мөч"
                />
              </FieldRow>
            </div>
          ))}
        </div>

        {/* Image count & pricing info */}
        <div
          className="se-image-limit-info"
          style={{
            marginBottom: 8,
            fontSize: 13,
            color: hasImages ? "#a855f7" : "#6b7280",
          }}
        >
          <MdPhotoCamera /> {memories.filter(m => m.src).length} зураг
          {hasImages && (
            <span style={{ marginLeft: 8, color: "#a855f7", fontWeight: 600 }}>
              <MdStar style={{color:'#9C27B0'}} /> ₮{EXTRA_IMAGE_PRICE}/зураг
            </span>
          )}
        </div>

        <button
          type="button"
          className="se-add-card-btn"
          onClick={addMemory}
          disabled={isAtMax}
          style={isAtMax ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          <span>＋</span> Дурсамж нэмэх
          {isAtMax && (
            <span style={{ fontSize: 11, marginLeft: 6 }}>
              (хамгийн ихдээ {effectiveMax})
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOVIE SELECTION EDITOR
// ═══════════════════════════════════════════════════════════════

export function MovieSelectionEditor({ section, onUpdate }) {
  const data = section?.data || {};
  const movies = Array.isArray(data.movies) ? data.movies : [];

  const update = (key, value) => {
    onUpdate(section.id, { ...data, [key]: value });
  };

  const updateMovies = (updated) => {
    update("movies", updated);
  };

  const addMovie = () => {
    updateMovies([...movies, { title: "", posterUrl: "", linkUrl: "" }]);
  };

  const removeMovie = (idx) => {
    updateMovies(movies.filter((_, i) => i !== idx));
  };

  const editMovie = (idx, key, value) => {
    const updated = [...movies];
    updated[idx] = { ...updated[idx], [key]: value };
    updateMovies(updated);
  };

  return (
    <div className="se-editor">
      <div className="se-group">
        <h3 className="se-group-title"><MdMovie /> Кино сонголт</h3>

        <FieldRow label="Гарчиг">
          <TextInputWithEmoji
            value={data.title}
            onChange={(v) => update("title", v)}
            placeholder="Кино сонголт"
          />
        </FieldRow>

        <FieldRow label="Тайлбар">
          <TextInputWithEmoji
            value={data.subtitle}
            onChange={(v) => update("subtitle", v)}
            placeholder="Дуртай киногоо сонгоорой"
            multiline
          />
        </FieldRow>

        <FieldRow label="Hint">
          <TextInputWithEmoji
            value={data.hint}
            onChange={(v) => update("hint", v)}
            placeholder="Poster дээр дарахад шинэ tab нээгдэнэ"
          />
        </FieldRow>

        <FieldRow label="Эргэх хугацаа (секунд)">
          <input
            className="se-input"
            type="number"
            min={8}
            max={60}
            value={data.spinSeconds ?? 20}
            onChange={(e) => update("spinSeconds", Number(e.target.value))}
          />
        </FieldRow>

        <FieldRow label="Continue товч">
          <TextInputWithEmoji
            value={data.continueButton}
            onChange={(v) => update("continueButton", v)}
            placeholder="Үргэлжлүүлэх"
          />
        </FieldRow>

        <FieldRow label="Кино жагсаалт">
          <div className="se-cards">
            {movies.map((m, idx) => (
              <div key={idx} className="se-card">
                <div className="se-card-header">
                  <span className="se-card-number">#{idx + 1}</span>
                  <button
                    type="button"
                    className="se-remove-btn"
                    onClick={() => removeMovie(idx)}
                    title="Устгах"
                  >
                    <MdClose />
                  </button>
                </div>

                <FieldRow label="Нэр">
                  <input
                    className="se-input"
                    type="text"
                    value={m.title || ""}
                    onChange={(e) => editMovie(idx, "title", e.target.value)}
                    placeholder="Avatar"
                  />
                </FieldRow>

                <FieldRow label="Poster URL">
                  <input
                    className="se-input"
                    type="text"
                    value={m.posterUrl || ""}
                    onChange={(e) =>
                      editMovie(idx, "posterUrl", e.target.value)
                    }
                    placeholder="https://..."
                  />
                </FieldRow>

                <FieldRow label="Ticketing URL (optional)">
                  <input
                    className="se-input"
                    type="text"
                    value={m.linkUrl || ""}
                    onChange={(e) => editMovie(idx, "linkUrl", e.target.value)}
                    placeholder="https://ticketing..."
                  />
                </FieldRow>
              </div>
            ))}
          </div>

          <button type="button" className="se-add-card-btn" onClick={addMovie}>
            <span>＋</span> Кино нэмэх
          </button>
        </FieldRow>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FUN QUESTIONS EDITOR
// ═══════════════════════════════════════════════════════════════

const QUESTION_TYPES = [
  { value: "choice", label: "Сонголт 🎯", desc: "Олон сонголтоос нэгийг" },
  { value: "text", label: "Текст ✍️", desc: "Чөлөөт хариулт бичих" },
  { value: "emoji_rate", label: "Emoji үнэлгээ 😍", desc: "Emoji-аар үнэлэх" },
  { value: "yesno", label: "Тийм / Үгүй ✅", desc: "Хоёроос сонгох" },
];

const DEFAULT_EMOJI_SCALE = ["😐", "🙂", "😊", "🥰", "😍"];

export function FunQuestionsEditor({ section, onUpdate }) {
  const data = section?.data || {};
  const questions = data.questions || [];
  const [expandedQ, setExpandedQ] = useState(null);

  const update = (key, value) => {
    onUpdate(section.id, { ...data, [key]: value });
  };

  const updateQuestions = (updated) => {
    update("questions", updated);
  };

  const addQuestion = (type = "choice") => {
    const id = `q_${Date.now()}`;
    let newQ = { id, type, emoji: "💬", question: "" };
    if (type === "choice") {
      newQ.options = [
        { emoji: "😊", text: "" },
        { emoji: "💖", text: "" },
      ];
    } else if (type === "text") {
      newQ.placeholder = "Бичнэ үү...";
    } else if (type === "emoji_rate") {
      newQ.scale = [...DEFAULT_EMOJI_SCALE];
    }
    updateQuestions([...questions, newQ]);
    setExpandedQ(questions.length);
  };

  const removeQuestion = (idx) => {
    updateQuestions(questions.filter((_, i) => i !== idx));
    if (expandedQ === idx) setExpandedQ(null);
  };

  const editQuestion = (idx, key, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [key]: value };
    updateQuestions(updated);
  };

  const moveQuestion = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= questions.length) return;
    const updated = [...questions];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updateQuestions(updated);
    setExpandedQ(newIdx);
  };

  // Options within a choice question
  const addOption = (qIdx) => {
    const q = questions[qIdx];
    const opts = [...(q.options || []), { emoji: "⭐", text: "" }];
    editQuestion(qIdx, "options", opts);
  };

  const removeOption = (qIdx, oIdx) => {
    const q = questions[qIdx];
    editQuestion(qIdx, "options", q.options.filter((_, i) => i !== oIdx));
  };

  const editOption = (qIdx, oIdx, key, value) => {
    const q = questions[qIdx];
    const opts = [...q.options];
    opts[oIdx] = { ...opts[oIdx], [key]: value };
    editQuestion(qIdx, "options", opts);
  };

  // Emoji scale editor
  const editScale = (qIdx, sIdx, value) => {
    const q = questions[qIdx];
    const scale = [...(q.scale || DEFAULT_EMOJI_SCALE)];
    scale[sIdx] = value;
    editQuestion(qIdx, "scale", scale);
  };

  return (
    <div className="se-editor">
      <div className="se-group">
        <h3 className="se-group-title"><MdQuestionAnswer /> Асуултууд</h3>

        <FieldRow label="Гарчиг">
          <TextInputWithEmoji
            value={data.title || ""}
            onChange={(v) => update("title", v)}
            placeholder="Хөгжилтэй асуултууд 💬"
          />
        </FieldRow>

        <FieldRow label="Дэд гарчиг">
          <TextInputWithEmoji
            value={data.subtitle || ""}
            onChange={(v) => update("subtitle", v)}
            placeholder="Надад хариулаач 🥰"
          />
        </FieldRow>

        <FieldRow label="Товчны текст">
          <TextInputWithEmoji
            value={data.continueButton || ""}
            onChange={(v) => update("continueButton", v)}
            placeholder="Үргэлжлүүлэх 💕"
          />
        </FieldRow>
      </div>

      <div className="se-group">
        <h3 className="se-group-title">📝 Асуултын жагсаалт</h3>

        <div className="se-steps">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="se-step">
              {/* Question header */}
              <div
                className="se-step-header"
                onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
              >
                <div className="se-step-header-left">
                  <span className="se-step-emoji">{q.emoji || "💬"}</span>
                  <span className="se-step-title">
                    {q.question || "Шинэ асуулт"}
                  </span>
                  <span className="se-step-badge">
                    {QUESTION_TYPES.find((t) => t.value === q.type)?.label || q.type}
                  </span>
                </div>
                <div className="se-step-header-right">
                  <button
                    type="button"
                    className="se-action-btn"
                    onClick={(e) => { e.stopPropagation(); moveQuestion(idx, -1); }}
                    disabled={idx === 0}
                    title="Дээш"
                  >↑</button>
                  <button
                    type="button"
                    className="se-action-btn"
                    onClick={(e) => { e.stopPropagation(); moveQuestion(idx, 1); }}
                    disabled={idx === questions.length - 1}
                    title="Доош"
                  >↓</button>
                  <button
                    type="button"
                    className="se-action-btn se-action-delete"
                    onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                    title="Устгах"
                  ><MdClose /></button>
                  <span className="se-step-chevron">
                    {expandedQ === idx ? "▾" : "▸"}
                  </span>
                </div>
              </div>

              {/* Expanded body */}
              {expandedQ === idx && (
                <div className="se-step-body">
                  <FieldRow label="Төрөл">
                    <select
                      className="se-input"
                      value={q.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const updated = { ...q, type: newType };
                        if (newType === "choice" && !updated.options) {
                          updated.options = [{ emoji: "😊", text: "" }, { emoji: "💖", text: "" }];
                        }
                        if (newType === "emoji_rate" && !updated.scale) {
                          updated.scale = [...DEFAULT_EMOJI_SCALE];
                        }
                        if (newType === "text" && !updated.placeholder) {
                          updated.placeholder = "Бичнэ үү...";
                        }
                        const all = [...questions];
                        all[idx] = updated;
                        updateQuestions(all);
                      }}
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
                      ))}
                    </select>
                  </FieldRow>

                  <FieldRow label="Emoji">
                    <input
                      className="se-input se-input-short"
                      type="text"
                      value={q.emoji || ""}
                      onChange={(e) => editQuestion(idx, "emoji", e.target.value)}
                      style={{ width: 50, textAlign: "center" }}
                    />
                  </FieldRow>

                  <FieldRow label="Асуулт">
                    <TextInputWithEmoji
                      value={q.question || ""}
                      onChange={(v) => editQuestion(idx, "question", v)}
                      placeholder="Асуултаа бичнэ үү..."
                    />
                  </FieldRow>

                  {/* Choice options */}
                  {q.type === "choice" && (
                    <div className="se-options-section">
                      <div className="se-options-header">
                        <span className="se-label">Сонголтууд</span>
                        <button
                          type="button"
                          className="se-add-btn-sm"
                          onClick={() => addOption(idx)}
                        >＋ Нэмэх</button>
                      </div>
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} className="se-option-card">
                          <div className="se-option-row">
                            <input
                              className="se-input se-input-short"
                              type="text"
                              value={opt.emoji || ""}
                              onChange={(e) => editOption(idx, oi, "emoji", e.target.value)}
                              style={{ width: 42, textAlign: "center" }}
                            />
                            <input
                              className="se-input"
                              type="text"
                              value={opt.text || ""}
                              onChange={(e) => editOption(idx, oi, "text", e.target.value)}
                              placeholder="Сонголтын текст"
                              style={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              className="se-remove-btn"
                              onClick={() => removeOption(idx, oi)}
                              title="Устгах"
                            ><MdClose /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text placeholder */}
                  {q.type === "text" && (
                    <FieldRow label="Placeholder">
                      <TextInputWithEmoji
                        value={q.placeholder || ""}
                        onChange={(v) => editQuestion(idx, "placeholder", v)}
                        placeholder="Бичнэ үү..."
                      />
                    </FieldRow>
                  )}

                  {/* Emoji scale */}
                  {q.type === "emoji_rate" && (
                    <FieldRow label="Emoji шатлал">
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(q.scale || DEFAULT_EMOJI_SCALE).map((em, si) => (
                          <input
                            key={si}
                            className="se-input se-input-short"
                            type="text"
                            value={em}
                            onChange={(e) => editScale(idx, si, e.target.value)}
                            style={{ width: 42, textAlign: "center" }}
                          />
                        ))}
                      </div>
                    </FieldRow>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add question buttons */}
        <div className="fqe-add-row">
          {QUESTION_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className="se-add-card-btn fqe-add-type-btn"
              onClick={() => addQuestion(t.value)}
            >
              <span>＋</span> {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FINAL SUMMARY EDITOR
// ═══════════════════════════════════════════════════════════════

export function FinalSummaryEditor({ section, onUpdate }) {
  const data = section?.data || {};
  const quotes = data.quotes || [];
  const [newQuote, setNewQuote] = useState("");

  const update = (key, value) => {
    onUpdate(section.id, { ...data, [key]: value });
  };

  const addQuote = () => {
    const trimmed = newQuote.trim();
    if (!trimmed) return;
    update("quotes", [...quotes, trimmed]);
    setNewQuote("");
  };

  const removeQuote = (idx) => {
    update(
      "quotes",
      quotes.filter((_, i) => i !== idx),
    );
  };

  const editQuote = (idx, value) => {
    const updated = [...quotes];
    updated[idx] = value;
    update("quotes", updated);
  };

  return (
    <div className="se-editor">
      <div className="se-group">
        <h3 className="se-group-title"><MdAutoAwesome /> Хураангуй хэсэг</h3>

        <FieldRow label="Ишлэлүүд (Quotes)">
          <div className="se-list">
            {quotes.map((q, idx) => (
              <div key={idx} className="se-list-item">
                <div className="se-input-with-emoji" style={{ flex: 1 }}>
                  <input
                    className="se-input"
                    type="text"
                    value={q}
                    onChange={(e) => editQuote(idx, e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="se-remove-btn"
                  onClick={() => removeQuote(idx)}
                  title="Устгах"
                >
                  <MdClose />
                </button>
              </div>
            ))}

            <div className="se-list-add">
              <div className="se-input-with-emoji" style={{ flex: 1 }}>
                <input
                  className="se-input"
                  type="text"
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  placeholder="Шинэ ишлэл нэмэх..."
                  onKeyDown={(e) => e.key === "Enter" && addQuote()}
                />
              </div>
              <button type="button" className="se-add-btn" onClick={addQuote}>
                ＋
              </button>
            </div>
          </div>
        </FieldRow>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GENERIC / UNSUPPORTED SECTION EDITOR
// ═══════════════════════════════════════════════════════════════

export function GenericEditor({ section }) {
  return (
    <div className="se-editor">
      <div className="se-group">
        <h3 className="se-group-title"><MdSettings /> {section.type}</h3>
        <p className="se-hint">
          Энэ хэсгийн тохиргоо одоогоор боломжгүй байна.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEMORY VIDEO EDITOR
// ═══════════════════════════════════════════════════════════════

export function MemoryVideoEditor({ section, onUpdate }) {
  const data = section?.data || {};
  const videos = data.videos || [];

  const updateVideos = (updated) => {
    onUpdate(section.id, { ...data, videos: updated });
  };

  const addVideo = () => {
    updateVideos([...videos, { src: "", caption: "", date: "", duration: 0 }]);
  };

  const removeVideo = (idx) => {
    updateVideos(videos.filter((_, i) => i !== idx));
  };

  const editVideo = (idx, key, value) => {
    const updated = [...videos];
    updated[idx] = { ...updated[idx], [key]: value };
    updateVideos(updated);
  };

  return (
    <div className="se-editor">
      <div className="se-group">
        <h3 className="se-group-title"><MdVideocam /> Видео хэсэг</h3>

        <FieldRow label="Гарчиг">
          <TextInputWithEmoji
            value={data.title}
            onChange={(v) => onUpdate(section.id, { ...data, title: v })}
            placeholder="Дурсамж бичлэг"
          />
        </FieldRow>

        <div className="se-cards">
          {videos.map((vid, idx) => (
            <div key={idx} className="se-card">
              <div className="se-card-header">
                <span className="se-card-number">#{idx + 1}</span>
                <button
                  type="button"
                  className="se-remove-btn"
                  onClick={() => removeVideo(idx)}
                  title="Устгах"
                >
                  <MdClose />
                </button>
              </div>

              <FieldRow label="Бичлэг оруулах">
                <VideoUploader
                  src={vid.src}
                  onUploaded={(url, duration) => {
                    const updated = [...videos];
                    updated[idx] = { ...updated[idx], src: url, duration: duration || 0 };
                    updateVideos(updated);
                  }}
                />
              </FieldRow>

              <FieldRow label="Огноо">
                <TextInputWithEmoji
                  value={vid.date || ""}
                  onChange={(v) => editVideo(idx, "date", v)}
                  placeholder="2024.03.15"
                />
              </FieldRow>

              <FieldRow label="Бичлэгний тайлбар">
                <TextInputWithEmoji
                  value={vid.caption || ""}
                  onChange={(v) => editVideo(idx, "caption", v)}
                  placeholder="Хамтдаа"
                />
              </FieldRow>
            </div>
          ))}
        </div>

        {/* Video pricing info */}
        {videos.filter(v => v.src).length > 0 && (
          <div
            className="se-image-limit-info"
            style={{
              marginBottom: 8,
              fontSize: 13,
              color: "#a855f7",
            }}
          >
            <MdVideocam /> {videos.filter(v => v.src).reduce((s, v) => s + (v.duration || 0), 0)} сек
            <span style={{ marginLeft: 8, color: "#a855f7", fontWeight: 600 }}>
              <MdStar style={{color:'#9C27B0'}} /> ₮{EXTRA_VIDEO_PRICE}/{VIDEO_CHUNK_SECONDS} секунд
            </span>
          </div>
        )}

        <button type="button" className="se-add-card-btn" onClick={addVideo}>
          <span>＋</span> Бичлэг нэмэх
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SIMPLE QUESTIONS EDITOR
// ═══════════════════════════════════════════════════════════════

export function SimpleQuestionsEditor({ section, onUpdate }) {
  const data = section?.data || {};
  const questions = data.questions || [];

  const update = (key, value) => {
    onUpdate(section.id, { ...data, [key]: value });
  };

  const updateQuestions = (updated) => {
    update("questions", updated);
  };

  const addQuestion = () => {
    const id = `sq_${Date.now()}`;
    updateQuestions([
      ...questions,
      { id, question: "", placeholder: "Хариултаа бичээрэй..." },
    ]);
  };

  const removeQuestion = (idx) => {
    updateQuestions(questions.filter((_, i) => i !== idx));
  };

  const editQuestion = (idx, key, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [key]: value };
    updateQuestions(updated);
  };

  const moveQuestion = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= questions.length) return;
    const updated = [...questions];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updateQuestions(updated);
  };

  return (
    <div className="se-editor">
      <div className="se-group">
        <h3 className="se-group-title"><MdChat /> Тохиргоо</h3>

        <FieldRow label="Гарчиг">
          <TextInputWithEmoji
            value={data.title || ""}
            onChange={(v) => update("title", v)}
            placeholder="Асуулт хариулт 💬"
          />
        </FieldRow>

        <FieldRow label="Дэд гарчиг">
          <TextInputWithEmoji
            value={data.subtitle || ""}
            onChange={(v) => update("subtitle", v)}
            placeholder="Миний асуултуудад хариулаач"
          />
        </FieldRow>

        <FieldRow label="Товч текст">
          <TextInputWithEmoji
            value={data.continueButton || ""}
            onChange={(v) => update("continueButton", v)}
            placeholder="Үргэлжлүүлэх"
          />
        </FieldRow>
      </div>

      <div className="se-group">
        <h3 className="se-group-title">
          <MdChat /> Асуултууд
          <span className="sqe-count-badge">{questions.length}</span>
        </h3>

        <div className="sqe-question-list">
          {questions.map((q, idx) => (
            <div key={q.id} className="sqe-q-card">
              <div className="sqe-q-top">
                <div className="sqe-q-num-pill">{idx + 1}</div>
                <div className="sqe-q-toolbar">
                  <button
                    type="button"
                    className="sqe-q-tool"
                    onClick={() => moveQuestion(idx, -1)}
                    disabled={idx === 0}
                    title="Дээшлүүлэх"
                  >
                    <MdArrowUpward />
                  </button>
                  <button
                    type="button"
                    className="sqe-q-tool"
                    onClick={() => moveQuestion(idx, 1)}
                    disabled={idx === questions.length - 1}
                    title="Доошлуулах"
                  >
                    <MdArrowDownward />
                  </button>
                  <button
                    type="button"
                    className="sqe-q-tool sqe-q-tool-del"
                    onClick={() => removeQuestion(idx)}
                    title="Устгах"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>

              <textarea
                className="sqe-q-input"
                value={q.question || ""}
                onChange={(e) => editQuestion(idx, "question", e.target.value)}
                placeholder="Асуултаа энд бичнэ үү..."
                rows={2}
              />

              <input
                className="sqe-q-ph"
                value={q.placeholder || ""}
                onChange={(e) => editQuestion(idx, "placeholder", e.target.value)}
                placeholder="Placeholder текст..."
              />
            </div>
          ))}
        </div>

        <button type="button" className="sqe-add-btn" onClick={addQuestion}>
          <span className="sqe-add-icon">+</span>
          Асуулт нэмэх
        </button>
      </div>
    </div>
  );
}
