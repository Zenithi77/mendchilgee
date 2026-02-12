import { useState } from "react";
import { SECTION_TYPES } from "../models/gift";
import EmojiPicker from "./EmojiPicker";
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
          rows={4}
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
              placeholder="Happy Valentine's Day 💕"
            />
          </FieldRow>

          <FieldRow label="Дэд гарчиг">
            <TextInputWithEmoji
              value={wd.subtitle}
              onChange={(v) => updateWelcome("subtitle", v)}
              placeholder="Тусгай урилга ❤️"
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
              placeholder="Урилга нээх 💌"
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
            placeholder="Чи намайг хайрладаг юу? 🥺💕"
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
            <p className="se-hint">Toggle OFF үед “Үгүй” товч энгийн (хувилбар текстгүй) байна.</p>
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

  const updateMemories = (updated) => {
    onUpdate(section.id, { ...data, memories: updated });
  };

  const addMemory = () => {
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

              <FieldRow label="Зургийн URL">
                <input
                  className="se-input"
                  type="text"
                  value={mem.src || ""}
                  onChange={(e) => editMemory(idx, "src", e.target.value)}
                  placeholder="https://... эсвэл хоосон орхих"
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

        <button type="button" className="se-add-card-btn" onClick={addMemory}>
          <span>＋</span> Дурсамж нэмэх
        </button>
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
    const newOpt = { emoji: "⭐", name: "", desc: "", value: "" };
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
        <h3 className="se-group-title">📝 Болзооны төлөвлөгөө</h3>

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
                            />
                          </div>
                          <input
                            className="se-input"
                            type="text"
                            value={opt.name || ""}
                            onChange={(e) =>
                              editOption(idx, oi, "name", e.target.value)
                            }
                            placeholder="Нэр"
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="se-add-card-btn" onClick={addStep}>
          <span>＋</span> Алхам нэмэх
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
