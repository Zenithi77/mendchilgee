import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { templateToGift } from "./models/gift";
import FloatingHearts from "./components/FloatingHearts";
import { MdPerson, MdConfirmationNumber, MdLogout, MdAdminPanelSettings } from "react-icons/md";
import "./App.css";

// ── Lazy-loaded route components ──
const AuthPage = lazy(() => import("./components/AuthPage"));
const GiftListPage = lazy(() => import("./components/GiftListPage"));
const CategorySelector = lazy(() => import("./components/CategorySelector"));
const TemplateSelector = lazy(() => import("./components/TemplateSelector"));
const Builder = lazy(() => import("./components/Builder"));
const GiftPreviewPage = lazy(() => import("./components/GiftPreviewPage"));
const BuilderPreview = lazy(() => import("./components/BuilderPreview"));
const GiftResponsesPage = lazy(() => import("./components/GiftResponsesPage"));
const DemoPaymentPage = lazy(() => import("./components/DemoPaymentPage"));
const PaymentSuccessPage = lazy(() => import("./components/PaymentSuccessPage"));
const PaymentCancelPage = lazy(() => import("./components/PaymentCancelPage"));
const TermsPage = lazy(() => import("./components/TermsPage"));
const PrivacyPage = lazy(() => import("./components/PrivacyPage"));
const TermsReacceptModal = lazy(() => import("./components/TermsReacceptModal"));
const PromoRedeemPage = lazy(() => import("./components/PromoRedeemPage"));
const PromoCodeModal = lazy(() => import("./components/PromoCodeModal"));
const AdminPromoPanel = lazy(() => import("./components/AdminPromoPanel"));

// Mendchilgee.site — Дижитал мэндчилгээний платформ

/*
  FLOW:
  0. CategorySelector — Баярын төрөл сонгох (march8, soldiers-day, birthday, valentine, general)
  1. TemplateSelector — Загвар сонгох (категориор шүүсэн)
  2. GiftRenderer — Data-driven section renderer
  Builder — Standalone full-screen gift builder (separate from the numbered flow)
*/

// ── Loading fallback for lazy components ──
function PageLoader() {
  return (
    <div className="app">
      <div className="loader-wrap">
        <div className="loader-ring" />
        <span className="loader-text">Ачааллаж байна</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
      <Route path="/promo/:code" element={<PromoRedeemPage />} />
      <Route path="/preview" element={<BuilderPreview />} />
      <Route path="/:giftId" element={<GiftPreviewPage />} />
      <Route path="*" element={<MainApp />} />
    </Routes>
    </Suspense>
  );
}

/** Wraps routes that require authentication */
function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <div className="loader-wrap">
          <div className="loader-ring" />
          <span className="loader-text">Ачааллаж байна</span>
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
  const { user, loading, logout, needsTermsReaccept, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [template, setTemplate] = useState(null); // kept for theme/effects at app level
  const [page, setPage] = useState("list"); // "list" | "category" | "template"
  const [showPromo, setShowPromo] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

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
        <div className="loader-wrap">
          <div className="loader-ring" />
          <span className="loader-text">Ачааллаж байна</span>
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
      {/* ── App Header ── */}
      <header className="app-header">
        <div className="header-left">
          <button
            className="header-btn header-btn-promo"
            onClick={() => setShowPromo(true)}
          >
            <MdConfirmationNumber /> <span>Промо код</span>
          </button>
          {isAdmin && (
            <button
              className="header-btn header-btn-admin"
              onClick={() => setShowAdmin(true)}
              title="Админ"
            >
              <MdAdminPanelSettings /> <span>Админ</span>
            </button>
          )}
        </div>
        <div className="header-right">
          <span className="header-email">
            {user.isAnonymous ? (
              <>
                <MdPerson /> Guest
              </>
            ) : (
              user.email
            )}
          </span>
          <button className="header-logout-btn" onClick={logout} title="Гарах">
            <MdLogout />
          </button>
        </div>
      </header>

      {/* ── Modals ── */}
      <PromoCodeModal
        open={showPromo}
        onClose={() => setShowPromo(false)}
        onSuccess={() => {}}
      />
      {/* ── Admin Panel ── */}
      {showAdmin && isAdmin ? (
        <div style={{ paddingTop: 56 }}>
          <AdminPromoPanel onBack={() => setShowAdmin(false)} />
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default App;
