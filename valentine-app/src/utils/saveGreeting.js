import html2canvas from "html2canvas";

/**
 * saveGreeting — Captures a DOM element (or the full page) as a PNG
 * image and triggers a download. Works on both mobile and desktop.
 *
 * On mobile browsers that support the Web Share API, it offers
 * a native share sheet so the user can save to camera roll,
 * send via messaging apps, etc.
 *
 * @param {HTMLElement} element  – The DOM element to capture (defaults to document.body)
 * @param {string}      filename – Download filename (without extension)
 * @returns {Promise<void>}
 */
export async function saveGreetingAsImage(element, filename = "mendchilgee") {
  const target = element || document.body;

  const canvas = await html2canvas(target, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    scale: 2, // retina quality
    logging: false,
    // Ignore floating UI elements that shouldn't appear in the screenshot
    ignoreElements: (el) => {
      return (
        el.classList?.contains("save-greeting-fab") ||
        el.classList?.contains("persistent-music-bar") ||
        el.classList?.contains("gift-preview-unpaid-banner")
      );
    },
  });

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );

  if (!blob) {
    console.error("[saveGreeting] Failed to create image blob");
    return;
  }

  const safeName = `${filename.replace(/[^a-zA-Z0-9_\-а-яА-ЯүөҮӨёЁ]/g, "_")}.png`;

  // Try native share (mobile) first
  if (navigator.canShare) {
    const file = new File([blob], safeName, { type: "image/png" });
    const shareData = { files: [file] };

    try {
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return; // shared successfully
      }
    } catch (err) {
      if (err.name === "AbortError") return; // user cancelled
      // fall through to download
    }
  }

  // Fallback: direct download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Convenience: capture the full visible viewport page.
 */
export async function saveCurrentPage(filename) {
  const page = document.querySelector(".gift-preview-page") || document.body;
  return saveGreetingAsImage(page, filename);
}
