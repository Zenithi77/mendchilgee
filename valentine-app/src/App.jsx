import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { templateToGift } from "./models/gift";
import AuthPage from "./components/AuthPage";
import GiftListPage from "./components/GiftListPage";
import CategorySelector from "./components/CategorySelector";
import TemplateSelector from "./components/TemplateSelector";
import Builder from "./components/Builder";
import GiftPreviewPage from "./components/GiftPreviewPage";
import GiftResponsesPage from "./components/GiftResponsesPage";
import DemoPaymentPage from "./components/DemoPaymentPage";
import PaymentSuccessPage from "./components/PaymentSuccessPage";
import PaymentCancelPage from "./components/PaymentCancelPage";
import TermsPage from "./components/TermsPage";
import PrivacyPage from "./components/PrivacyPage";
import TermsReacceptModal from "./components/TermsReacceptModal";
import FloatingHearts from "./components/FloatingHearts";
import "./App.css";

// Mendchilgee.site — Дижитал мэндчилгээний платформ

/*
  FLOW:
  0. CategorySelector — Баярын төрөл сонгох (march8, soldiers-day, birthday, valentine, general)
  1. TemplateSelector — Загвар сонгох (категориор шүүсэн)
  2. GiftRenderer — Data-driven section renderer
  Builder — Standalone full-screen gift builder (separate from the numbered flow)
*/

function App() {
  return (
    <Routes>
      <Route
        path="/builder/:giftId"
        element={
          <AuthGuard>
            <Builder />
          </AuthGuard>
        }
      />
      <Route
        path="/builder"
        element={
          <AuthGuard>
            <Builder />
          </AuthGuard>
        }
      />
      <Route path="/responses/:giftId" element={<GiftResponsesPage />} />
      <Route path="/demo-payments" element={<DemoPaymentPage />} />
      <Route path="/demo-payments/success" element={<PaymentSuccessPage />} />
      <Route path="/demo-payments/cancel" element={<PaymentCancelPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/cancel" element={<PaymentCancelPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/:giftId" element={<GiftPreviewPage />} />
      <Route path="*" element={<MainApp />} />
    </Routes>
  );
}

/** Wraps routes that require authentication */
function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <div className="auth-loading">
          <div className="auth-loading-spinner">🎉</div>
          <p>Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return children;
}

function MainApp() {
  const { user, loading, logout, needsTermsReaccept } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [template, setTemplate] = useState(null); // kept for theme/effects at app level
  const [page, setPage] = useState("list"); // "list" | "category" | "template"

  // Apply theme CSS variables when template changes
  useEffect(() => {
    if (template) {
      const root = document.documentElement;
      Object.entries(template.theme.colors).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    }
  }, [template]);

  const handleCreateNew = useCallback(() => {
    setPage("category");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleSelectCategory = useCallback((catId) => {
    setCategory(catId);
    setPage("template");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleSelectTemplate = useCallback(
    (tmpl) => {
      setTemplate(tmpl);
      const newGift = templateToGift(tmpl);
      navigate("/builder", { state: { initialGift: newGift } });
    },
    [navigate],
  );

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

  const resetToList = useCallback(() => {
    setTemplate(null);
    setCategory(null);
    setPage("list");
    clearThemeVars();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [clearThemeVars]);

  const resetToCategory = useCallback(() => {
    setTemplate(null);
    setCategory(null);
    setPage("category");
    clearThemeVars();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [clearThemeVars]);

  const handleEditGift = useCallback(
    (gift) => {
      navigate(`/builder/${gift.id}`);
    },
    [navigate],
  );

  const themeClass = template ? template.theme.className : "";

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="app">
        <div className="auth-loading">
          <div className="auth-loading-spinner">🎉</div>
          <p>Ачаалж байна...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show terms re-acceptance modal if policy version changed
  if (needsTermsReaccept && !user.isAnonymous) {
    return (
      <div className="app">
        <TermsReacceptModal />
      </div>
    );
  }

  return (
    <div className={`app ${themeClass}`}>
      {/* User info & logout button */}
      <div className="user-menu">
        <span className="user-email">
          {user.isAnonymous ? "👤 Guest" : `${user.email}`}
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
      {page === "category" && (
        <button className="back-to-selector" onClick={resetToList}>
          Буцах
        </button>
      )}
      {page === "template" && (
        <button className="back-to-selector" onClick={resetToCategory}>
          Буцах
        </button>
      )}

      {/* Pages */}
      {page === "list" && (
        <GiftListPage
          onCreateNew={handleCreateNew}
          onEditGift={handleEditGift}
        />
      )}
      {page === "category" && (
        <CategorySelector
          onSelect={handleSelectCategory}
          onOpenBuilder={() => navigate("/builder")}
        />
      )}
      {page === "template" && (
        <TemplateSelector onSelect={handleSelectTemplate} category={category} />
      )}
    </div>
  );
}

export default App;
