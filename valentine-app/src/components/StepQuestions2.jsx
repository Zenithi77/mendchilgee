import { useState } from "react";

export default function StepQuestions({
  steps,
  choices,
  updateChoice,
  onDone,
  onBack,
  template,
}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState("next");
  const current = steps[step];
  const totalSteps = steps.length;
  const stepUI = template?.stepQuestions || {};

  const handleSelect = (value) => {
    if (current.multiSelect) {
      // Multi-select: toggle value in array
      const currentArr = Array.isArray(choices[current.key])
        ? choices[current.key]
        : [];
      if (currentArr.includes(value)) {
        updateChoice(
          current.key,
          currentArr.filter((v) => v !== value),
        );
      } else {
        updateChoice(current.key, [...currentArr, value]);
      }
    } else {
      // Single select
      updateChoice(current.key, value);
    }
  };

  const isOptionSelected = (value) => {
    const val = choices[current.key];
    if (current.multiSelect) {
      return Array.isArray(val) && val.includes(value);
    }
    return val === value;
  };

  const hasSelection = () => {
    const val = choices[current.key];
    if (current.multiSelect) {
      return Array.isArray(val) && val.length > 0;
    }
    return val != null;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setDirection("next");
      setStep(step + 1);
    } else {
      onDone();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection("back");
      setStep(step - 1);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className={`page step-page-${direction}`} key={`step-${step}`}>
      <div className="glass step-card">
        {/* Step indicator */}
        <div className="step-indicator">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`step-dot${i === step ? " active" : i < step ? " done" : ""}`}
            />
          ))}
        </div>

        <div className="step-emoji">{current.emoji}</div>
        <h2 className="step-title">{current.title}</h2>

        {/* Multi-select hint */}
        {current.multiSelect && (
          <p className="multi-hint">
            {stepUI.multiSelectHint || "✨ Олон хариулт сонгох боломжтой"}
          </p>
        )}

        {/* Grid options */}
        {current.type === 'grid' && (
          <div className={`step-options ${current.options.length === 1 ? 'single' : ''}`}>
            {current.options.map(opt => (
              <div
                key={opt.value}
                className={`step-option${isOptionSelected(opt.value) ? " selected" : ""}`}
                onClick={() => handleSelect(opt.value)}
              >
                {/* Checkmark for multi-select */}
                {current.multiSelect && (
                  <div
                    className={`multi-check${isOptionSelected(opt.value) ? " checked" : ""}`}
                  >
                    {isOptionSelected(opt.value) ? "✓" : ""}
                  </div>
                )}
                <div className="opt-emoji">{opt.emoji}</div>
                <div className="opt-name">{opt.name}</div>
                {opt.desc && <div className="opt-desc">{opt.desc}</div>}
              </div>
            ))}
          </div>
        )}
        {/* Time options */}
        {current.type === "time" && (
          <div className="time-options">
            {current.options.map((opt) => (
              <div
                key={opt.value}
                className={`time-chip${isOptionSelected(opt.value) ? " selected" : ""}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}

        {/* Selected count for multi-select */}
        {current.multiSelect &&
          Array.isArray(choices[current.key]) &&
          choices[current.key].length > 0 && (
            <div className="selected-count">
              {choices[current.key].length}{" "}
              {stepUI.selectedCountSuffix || "сонгогдсон ✨"}
            </div>
          )}

        {/* Nav buttons */}
        <div className="step-nav">
          <button className="btn btn-ghost" onClick={handleBack}>
            {stepUI.backButton || "← Буцах"}
          </button>
          <button
            className="btn btn-magic"
            disabled={!hasSelection()}
            onClick={handleNext}
          >
            {step < totalSteps - 1
              ? stepUI.nextButton || "Дараагийх →"
              : stepUI.doneButton || "Баталгаажуулах 💕"}
          </button>
        </div>
      </div>
    </div>
  );
}
