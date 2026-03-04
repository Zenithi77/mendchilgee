// ═══════════════════════════════════════════════════════════════
// BuilderPreview — Renders gift preview from postMessage data
// Used by Builder iframes for live preview without saving to Firestore
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import GiftRenderer from "./GiftRenderer";

export default function BuilderPreview() {
  const [gift, setGift] = useState(null);
  const [sectionIndex, setSectionIndex] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      if (e.origin !== window.location.origin) return;

      if (e.data?.type === "builder-preview-data") {
        setGift(e.data.gift);
        // Apply theme CSS variables
        if (e.data.gift?.theme?.colors) {
          const root = document.documentElement;
          Object.entries(e.data.gift.theme.colors).forEach(([key, val]) => {
            root.style.setProperty(key, val);
          });
        }
      }

      if (e.data?.type === "builder-go-to-section") {
        const idx = e.data.index;
        if (typeof idx === "number" && idx >= 0) {
          setSectionIndex(idx);
        }
      }
    };

    window.addEventListener("message", handler);

    // Tell parent we're ready to receive data
    window.parent.postMessage({ type: "builder-preview-ready" }, window.location.origin);

    return () => window.removeEventListener("message", handler);
  }, []);

  if (!gift) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        color: "rgba(255,255,255,0.5)",
        fontFamily: "inherit",
        fontSize: "0.9rem",
        textAlign: "center",
        padding: "20px",
      }}>
        Ачаалж байна...
      </div>
    );
  }

  return (
    <GiftRenderer
      gift={gift}
      startDate={gift.startDate}
      category={gift.category}
      initialSectionIndex={sectionIndex}
      giftId={gift.id || "preview"}
      persistResponses={false}
      key={`preview-${sectionIndex}`}
    />
  );
}
