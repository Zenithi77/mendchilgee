import { useState } from "react";
import { SECTION_TYPES } from "../models/gift";
import EmojiPicker from "./EmojiPicker";
import {
  uploadMemoryPhoto,
  uploadMemoryVideo,
} from "../services/storageService";
import { useAuth } from "../contexts/AuthContext";
import { getSectionLimits } from "../config/featureRegistry";
import { TIERS, TIER_META } from "../config/tiers";
import "./SectionEditors.css";

// ═══════════════════════════════════════════════════════════════
// Shared helpers
// ═══════════════════════════════════════════════════════════════

/** Insert emoji at cursor position of a text input/textarea identified by refId */
function insertEmojiAtCursor(value, emoji) {
  return (value || "") + emoji;
}

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
  const handleEmoji = (emoji) => {
    onChange(insertEmojiAtCursor(value, emoji));
  };

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
      <EmojiPicker onSelect={handleEmoji} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Image Uploader — uploads to Firebase Storage
// ═══════════════════════════════════════════════════════════════

function ImageUploader({ src, onUploaded }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setUploading(true);
      const url = await uploadMemoryPhoto(file, user.uid);
      onUploaded(url);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
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
            ✕
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
            <span className="se-upload-progress">📤 Хуулж байна...</span>
          ) : (
            <span className="se-upload-text">📷 Зураг сонгох</span>
          )}
        </label>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Video Uploader — uploads video to Firebase Storage
// ═══════════════════════════════════════════════════════════════

function VideoUploader({ src, onUploaded }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setUploading(true);
      const url = await uploadMemoryVideo(file, user.uid);
      onUploaded(url);
    } catch (err) {
      console.error("Video upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="se-image-uploader">
      {src ? (
        <div className="se-image-preview">
          <video
            src={src}
            className="se-image-thumb"
            style={{ objectFit: "cover" }}
          />
          <button
            type="button"
            className="se-image-remove"
            onClick={() => onUploaded("")}
            title="Устгах"
          >
            ✕
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
            <span className="se-upload-progress">📤 Хуулж байна...</span>
          ) : (
            <span className="se-upload-text">🎬 Бичлэг сонгох</span>
          )}
        </label>
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
          <h3 className="se-group-title">🎉 Нүүр хэсэг (Welcome)</h3>

          <FieldRow label="Гарчиг">
            <TextInputWithEmoji
              value={wd.title}
              onChange={(v) => updateWelcome("title", v)}
              placeholder="Мэндчилгээ 🎉"
            />
          </FieldRow>

          <FieldRow label="Дэд гарчиг">
            <TextInputWithEmoji
              value={wd.subtitle}
              onChange={(v) => updateWelcome("subtitle", v)}
              placeholder="Тусгай мэндчилгээ ✨"
              multiline
            />
          </FieldRow>

          <FieldRow label="Анх уулзсан өдөр">
            <input
              className="se-input"
              type="date"
              value={wd.startDate || ""}
              onChange={(e) => updateWelcome("startDate", e.target.value)}
            />
          </FieldRow>

          <FieldRow label="Товчлуурын текст">
            <TextInputWithEmoji
              value={wd.buttonText}
              onChange={(v) => updateWelcome("buttonText", v)}
              placeholder="Мэндчилгээ нээх 🎁"
            />
          </FieldRow>
        </div>
      )}

      {/* Love Letter fields */}
      {letterSection && (
        <div className="se-group">
          <h3 className="se-group-title">💌 Захидал хэсэг (Love Letter)</h3>

          <FieldRow label="Гарчиг">
            <TextInputWithEmoji
              value={ld.title}
              onChange={(v) => updateLetter("title", v)}
              placeholder="Миний зүрхний захидал 💌"
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

          <FieldRow label="🎵 Дуу (YouTube URL)">
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

          <FieldRow label="🎵 Дууны нэр">
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
              placeholder="🎵 Romantic Music"
            />
          </FieldRow>
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
        <h3 className="se-group-title">💝 Асуулга хэсэг</h3>

        <FieldRow label="Асуултын текст">
          <TextInputWithEmoji
            value={data.text}
            onChange={(v) => update("text", v)}
            placeholder="Та надад санагдах уу? 🥺✨"
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
                    <EmojiPicker
                      onSelect={(emoji) => editMessage(idx, msg + emoji)}
                    />
                  </div>
                  <button
                    type="button"
                    className="se-remove-btn"
                    onClick={() => removeMessage(idx)}
                    title="Устгах"
                  >
                    ✕
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
                  <EmojiPicker
                    onSelect={(emoji) => setNewMsg((p) => p + emoji)}
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

export function MemoryGalleryEditor({ section, onUpdate }) {
  const data = section?.data || {};
  const memories = data.memories || [];

  // Image limits from feature registry
  const standardLimits = getSectionLimits(
    SECTION_TYPES.MEMORY_GALLERY,
    TIERS.STANDARD,
  );
  const premiumLimits = getSectionLimits(
    SECTION_TYPES.MEMORY_GALLERY,
    TIERS.PREMIUM,
  );
  const standardMax = standardLimits?.maxImages || 6;
  const premiumMax = premiumLimits?.maxImages || 10;
  const isOverStandard = memories.length > standardMax;
  const isAtPremiumMax = memories.length >= premiumMax;

  const updateMemories = (updated) => {
    onUpdate(section.id, { ...data, memories: updated });
  };

  const addMemory = () => {
    if (isAtPremiumMax) return; // Hard cap at premium limit
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
        <h3 className="se-group-title">📸 Зургийн цомог</h3>

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
                  ✕
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
                  placeholder="Анхны мөч ✨"
                />
              </FieldRow>
            </div>
          ))}
        </div>

        {/* Image count & tier info */}
        <div
          className="se-image-limit-info"
          style={{
            marginBottom: 8,
            fontSize: 13,
            color: isOverStandard ? "#a855f7" : "#6b7280",
          }}
        >
          📷 {memories.length} / {isOverStandard ? premiumMax : standardMax}{" "}
          зураг
          {isOverStandard && (
            <span style={{ marginLeft: 8, color: "#a855f7", fontWeight: 600 }}>
              🟣 Премиум ({standardMax}-с дээш)
            </span>
          )}
        </div>

        <button
          type="button"
          className="se-add-card-btn"
          onClick={addMemory}
          disabled={isAtPremiumMax}
          style={isAtPremiumMax ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          <span>＋</span> Дурсамж нэмэх
          {isAtPremiumMax && (
            <span style={{ fontSize: 11, marginLeft: 6 }}>
              (хамгийн ихдээ {premiumMax})
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
        <h3 className="se-group-title">🎬 Кино сонголт</h3>

        <FieldRow label="Гарчиг">
          <TextInputWithEmoji
            value={data.title}
            onChange={(v) => update("title", v)}
            placeholder="Кино сонголт 🎬"
          />
        </FieldRow>

        <FieldRow label="Тайлбар">
          <TextInputWithEmoji
            value={data.subtitle}
            onChange={(v) => update("subtitle", v)}
            placeholder="Дуртай киногоо сонгоорой 💞"
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
            placeholder="Үргэлжлүүлэх ✨"
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
                    ✕
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
// STEP QUESTIONS EDITOR
// ═══════════════════════════════════════════════════════════════

export function StepQuestionsEditor({ section, onUpdate }) {
  const data = section?.data || {};
  const steps = data.steps || [];
  const [expandedStep, setExpandedStep] = useState(null);

  const updateSteps = (updated) => {
    onUpdate(section.id, { ...data, steps: updated });
  };

  const addStep = () => {
    const newStep = {
      emoji: "📍",
      title: "Шинэ алхам",
      key: `step_${Date.now()}`,
      type: "grid",
      multiSelect: false,
      options: [],
    };
    updateSteps([...steps, newStep]);
    setExpandedStep(steps.length);
  };

  const removeStep = (idx) => {
    updateSteps(steps.filter((_, i) => i !== idx));
    if (expandedStep === idx) setExpandedStep(null);
  };

  const editStep = (idx, key, value) => {
    const updated = [...steps];
    updated[idx] = { ...updated[idx], [key]: value };
    updateSteps(updated);
  };

  const moveStep = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= steps.length) return;
    const updated = [...steps];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updateSteps(updated);
    setExpandedStep(newIdx);
  };

  // -- Options within a step --
  const addOption = (stepIdx) => {
    const step = steps[stepIdx];
    const newOpt =
      step.type === "time"
        ? { label: "🕐 12:00", value: "12:00" }
        : { emoji: "⭐", name: "", desc: "", value: "" };
    editStep(stepIdx, "options", [...(step.options || []), newOpt]);
  };

  const removeOption = (stepIdx, optIdx) => {
    const step = steps[stepIdx];
    editStep(
      stepIdx,
      "options",
      step.options.filter((_, i) => i !== optIdx),
    );
  };

  const editOption = (stepIdx, optIdx, key, value) => {
    const step = steps[stepIdx];
    const opts = [...step.options];
    opts[optIdx] = { ...opts[optIdx], [key]: value };
    // Keep value in sync with name if not explicitly set differently
    if (key === "name") {
      opts[optIdx].value = value;
    }
    editStep(stepIdx, "options", opts);
  };

  return (
    <div className="se-editor">
      <div className="se-group">
        <h3 className="se-group-title">📝 Төлөвлөгөө</h3>

        <div className="se-steps">
          {steps.map((step, idx) => (
            <div key={idx} className="se-step">
              {/* Step header — always visible */}
              <div
                className="se-step-header"
                onClick={() =>
                  setExpandedStep(expandedStep === idx ? null : idx)
                }
              >
                <div className="se-step-header-left">
                  <span className="se-step-emoji">{step.emoji}</span>
                  <span className="se-step-title">{step.title}</span>
                  <span className="se-step-badge">
                    {step.options?.length || 0} сонголт
                  </span>
                </div>
                <div className="se-step-header-right">
                  <button
                    type="button"
                    className="se-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveStep(idx, -1);
                    }}
                    disabled={idx === 0}
                    title="Дээш"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="se-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveStep(idx, 1);
                    }}
                    disabled={idx === steps.length - 1}
                    title="Доош"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="se-action-btn se-action-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStep(idx);
                    }}
                    title="Устгах"
                  >
                    ✕
                  </button>
                  <span className="se-step-chevron">
                    {expandedStep === idx ? "▾" : "▸"}
                  </span>
                </div>
              </div>

              {/* Step body — expanded */}
              {expandedStep === idx && (
                <div className="se-step-body">
                  <FieldRow label="Emoji">
                    <div className="se-input-with-emoji">
                      <input
                        className="se-input se-input-short"
                        type="text"
                        value={step.emoji || ""}
                        onChange={(e) => editStep(idx, "emoji", e.target.value)}
                      />
                      <EmojiPicker
                        onSelect={(emoji) => editStep(idx, "emoji", emoji)}
                      />
                    </div>
                  </FieldRow>

                  <FieldRow label="Гарчиг">
                    <TextInputWithEmoji
                      value={step.title}
                      onChange={(v) => editStep(idx, "title", v)}
                      placeholder="Хаана уулзах вэ?"
                    />
                  </FieldRow>

                  <FieldRow label="Төрөл">
                    <select
                      className="se-input"
                      value={step.type || "grid"}
                      onChange={(e) => editStep(idx, "type", e.target.value)}
                    >
                      <option value="grid">Сонголтын сүлжээ (grid)</option>
                      <option value="time">Цаг сонголт (time)</option>
                    </select>
                  </FieldRow>

                  {step.type !== "time" && (
                    <FieldRow label="Олон сонголт">
                      <label className="se-toggle">
                        <input
                          type="checkbox"
                          checked={step.multiSelect || false}
                          onChange={(e) =>
                            editStep(idx, "multiSelect", e.target.checked)
                          }
                        />
                        <span className="se-toggle-slider" />
                        <span className="se-toggle-label">
                          {step.multiSelect ? "Тийм" : "Үгүй"}
                        </span>
                      </label>
                    </FieldRow>
                  )}

                  {/* Options */}
                  <div className="se-options-section">
                    <div className="se-options-header">
                      <span className="se-label">Сонголтууд</span>
                      <button
                        type="button"
                        className="se-add-btn-sm"
                        onClick={() => addOption(idx)}
                      >
                        ＋ Нэмэх
                      </button>
                    </div>

                    {(step.options || []).map((opt, oi) => (
                      <div key={oi} className="se-option-card">
                        {step.type === "time" ? (
                          /* ── Time option: emoji picker + label (e.g. "🌅 17:00") ── */
                          <div className="se-option-row">
                            <div
                              className="se-input-with-emoji"
                              style={{ width: "60px" }}
                            >
                              <EmojiPicker
                                onSelect={(emoji) => {
                                  // Replace emoji prefix in label
                                  const timePart = (opt.label || "").replace(
                                    /^\S+\s*/,
                                    "",
                                  );
                                  editOption(
                                    idx,
                                    oi,
                                    "label",
                                    `${emoji} ${timePart}`,
                                  );
                                }}
                                triggerLabel={
                                  (opt.label || "").match(/^(\S+)\s/)?.[1] ||
                                  "🕐"
                                }
                              />
                            </div>
                            <select
                              className="se-input"
                              value={opt.value || ""}
                              onChange={(e) => {
                                const time = e.target.value;
                                const emojiPart =
                                  (opt.label || "").match(/^(\S+)\s/)?.[1] ||
                                  "🕐";
                                editOption(idx, oi, "value", time);
                                editOption(
                                  idx,
                                  oi,
                                  "label",
                                  `${emojiPart} ${time}`,
                                );
                              }}
                              style={{ flex: 1 }}
                            >
                              <option value="">Цаг сонгох...</option>
                              {Array.from({ length: 24 }, (_, h) => {
                                const t = `${String(h).padStart(2, "0")}:00`;
                                return (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                );
                              })}
                            </select>
                            <span
                              className="se-time-preview"
                              style={{
                                minWidth: 80,
                                textAlign: "center",
                                fontSize: "0.85rem",
                                color: "#64748b",
                              }}
                            >
                              {opt.label || "—"}
                            </span>
                            <button
                              type="button"
                              className="se-remove-btn"
                              onClick={() => removeOption(idx, oi)}
                              title="Устгах"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          /* ── Grid option: emoji + name + desc ── */
                          <div className="se-option-row">
                            <div
                              className="se-input-with-emoji"
                              style={{ width: "60px" }}
                            >
                              <input
                                className="se-input se-input-short"
                                type="text"
                                value={opt.emoji || ""}
                                onChange={(e) =>
                                  editOption(idx, oi, "emoji", e.target.value)
                                }
                                style={{ width: "36px", textAlign: "center" }}
                              />
                              <EmojiPicker
                                onSelect={(emoji) =>
                                  editOption(idx, oi, "emoji", emoji)
                                }
                                triggerLabel={opt.emoji || "😊"}
                              />
                            </div>
                            <input
                              className="se-input"
                              type="text"
                              value={opt.name || ""}
                              onChange={(e) =>
                                editOption(idx, oi, "name", e.target.value)
                              }
                              placeholder="Сонголт"
                              style={{ flex: 1 }}
                            />
                            <input
                              className="se-input"
                              type="text"
                              value={opt.desc || ""}
                              onChange={(e) =>
                                editOption(idx, oi, "desc", e.target.value)
                              }
                              placeholder="Тайлбар"
                              style={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              className="se-remove-btn"
                              onClick={() => removeOption(idx, oi)}
                              title="Устгах"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="se-add-card-btn" onClick={addStep}>
          <span>＋</span> Асуулт нэмэх
        </button>
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
        <h3 className="se-group-title">🎊 Хураангуй хэсэг</h3>

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
                  <EmojiPicker
                    onSelect={(emoji) => editQuote(idx, q + emoji)}
                  />
                </div>
                <button
                  type="button"
                  className="se-remove-btn"
                  onClick={() => removeQuote(idx)}
                  title="Устгах"
                >
                  ✕
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
                <EmojiPicker
                  onSelect={(emoji) => setNewQuote((p) => p + emoji)}
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
        <h3 className="se-group-title">⚙️ {section.type}</h3>
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
    updateVideos([...videos, { src: "", caption: "", date: "" }]);
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
        <h3 className="se-group-title">🎬 Видео хэсэг</h3>

        <FieldRow label="Гарчиг">
          <TextInputWithEmoji
            value={data.title}
            onChange={(v) => onUpdate(section.id, { ...data, title: v })}
            placeholder="Дурсамж бичлэг 🎬"
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
                  ✕
                </button>
              </div>

              <FieldRow label="Бичлэг оруулах">
                <VideoUploader
                  src={vid.src}
                  onUploaded={(url) => editVideo(idx, "src", url)}
                />
              </FieldRow>

              <FieldRow label="Огноо">
                <TextInputWithEmoji
                  value={vid.date || ""}
                  onChange={(v) => editVideo(idx, "date", v)}
                  placeholder="2024.03.15"
                />
              </FieldRow>

              <FieldRow label="Бичлэгний гарчиг">
                <TextInputWithEmoji
                  value={vid.caption || ""}
                  onChange={(v) => editVideo(idx, "caption", v)}
                  placeholder="Хамтдаа ✨"
                />
              </FieldRow>
            </div>
          ))}
        </div>

        <button type="button" className="se-add-card-btn" onClick={addVideo}>
          <span>＋</span> Бичлэг нэмэх
        </button>
      </div>
    </div>
  );
}
