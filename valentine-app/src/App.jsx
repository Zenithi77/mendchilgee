import { useState, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { templateToGift } from "./models/gift";
import AuthPage from "./components/AuthPage";
import CategorySelector from "./components/CategorySelector";
import TemplateSelector from "./components/TemplateSelector";
import GiftRenderer from "./components/GiftRenderer";
import Builder from "./components/Builder";
import GiftPreviewPage from "./components/GiftPreviewPage";
import FloatingHearts from "./components/FloatingHearts";
import "./App.css";

// ⬇️ ЭНДЭЭС ӨӨРЧЛӨХ: Хосын эхлэсэн огноо
const RELATIONSHIP_START = new Date("2024-03-15");

/*
  FLOW:
  0. CategorySelector — Категори сонгох (crush, new-couple, long-term, y2k)
  1. TemplateSelector — Загвар сонгох (категориор шүүсэн)
  2. GiftRenderer — Data-driven section renderer
     (welcome → loveLetter → question → memoryGallery → stepQuestions → finalSummary)
  Builder — Standalone full-screen gift builder (separate from the numbered flow)
*/

function App() {
  return (
    <Routes>
      <Route path="/preview/:giftId" element={<GiftPreviewPage />} />
      <Route path="*" element={<MainApp />} />
    </Routes>
  );
}

function MainApp() {
  const { user, loading, logout } = useAuth();
  const [category, setCategory] = useState(null);
  const [template, setTemplate] = useState(null); // kept for theme/effects at app level
  const [gift, setGift] = useState(null);
  const [page, setPage] = useState(0); // 0 = category, 1 = template, 2 = gift
  const [showBuilder, setShowBuilder] = useState(false);

  // Apply theme CSS variables when template changes
  useEffect(() => {
    if (template) {
      const root = document.documentElement;
      Object.entries(template.theme.colors).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    }
  }, [template]);

  const handleSelectCategory = useCallback((catId) => {
    setCategory(catId);
    setPage(1); // go to template selector
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleSelectTemplate = useCallback((tmpl) => {
    setTemplate(tmpl);
    setGift(templateToGift(tmpl));
    setPage(2);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const clearThemeVars = useCallback(() => {
    const root = document.documentElement;
    [
      "--t-primary",
      "--t-secondary",
      "--t-accent",
      "--t-accent2",
      "--t-soft",
      "--t-light",
      "--t-bg",
      "--t-bg2",
      "--t-glass",
      "--t-glass-border",
    ].forEach((k) => root.style.removeProperty(k));
  }, []);

  const resetToCategory = useCallback(() => {
    setTemplate(null);
    setGift(null);
    setCategory(null);
    setPage(0);
    setShowBuilder(false);
    clearThemeVars();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [clearThemeVars]);
  const resetToTemplates = useCallback(() => {
    setTemplate(null);
    setGift(null);
    setPage(1);
    clearThemeVars();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [clearThemeVars]);

  // Click sparkle effect
  useEffect(() => {
    const emojis = template?.effects?.clickSparkles || ["✨", "💖", "💕", "⭐"];
    const handle = (e) => {
      const el = document.createElement("span");
      el.className = "click-sparkle";
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 800);
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [template]);

  const themeClass = template ? template.theme.className : "";

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="app">
        <div className="auth-loading">
          <div className="auth-loading-spinner">💕</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Builder takes over the full viewport
  if (showBuilder) {
    return <Builder onBack={resetToCategory} />;
  }

  return (
    <div className={`app ${themeClass}`}>
      {/* User info & logout button */}
      <div className="user-menu">
        <span className="user-email">
          {user.isAnonymous ? "👤 Guest" : `💌 ${user.email}`}
        </span>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Background effects */}
      <div className="bg-effects">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <FloatingHearts emojis={template?.effects?.floatingHearts} />

      {/* Back buttons */}
      {page === 1 && (
        <button className="back-to-selector" onClick={resetToCategory}>
          ← Категори солих
        </button>
      )}
      {page === 2 && (
        <button className="back-to-selector" onClick={resetToTemplates}>
          ← Загвар солих
        </button>
      )}

      {/* Pages */}
      {page === 0 && (
        <CategorySelector
          onSelect={handleSelectCategory}
          onOpenBuilder={() => setShowBuilder(true)}
        />
      )}
      {page === 1 && (
        <TemplateSelector onSelect={handleSelectTemplate} category={category} />
      )}
      {page === 2 && gift && (
        <GiftRenderer
          key={gift.templateId}
          gift={gift}
          startDate={RELATIONSHIP_START}
          category={category}
        />
      )}
    </div>
  );
}

export default App;
