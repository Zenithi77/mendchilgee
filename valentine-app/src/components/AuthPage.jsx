import { useState } from "react";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginAnonymously,
} from "../services/authService";
import { saveTermsAgreement } from "../services/firestoreService";
import { TERMS_VERSION } from "../legal/terms";
import "./AuthPage.css";
import "./LegalPage.css";

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // Pick up any Google OAuth error from sessionStorage (set by callback handler)
  useState(() => {
    const storedError = sessionStorage.getItem("google_auth_error");
    if (storedError) {
      setError(storedError);
      sessionStorage.removeItem("google_auth_error");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        if (!termsAccepted) {
          setTermsError(true);
          setError("Үйлчилгээний нөхцөл зөвшөөрөх шаардлагатай");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        const userCredential = await registerWithEmail(email, password);
        // Save terms agreement after successful signup
        await saveTermsAgreement(userCredential.user.uid, TERMS_VERSION);
      }
      onAuthSuccess?.();
    } catch (err) {
      console.error("Auth error:", err);
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        case "auth/wrong-password":
          setError("Incorrect password");
          break;
        case "auth/email-already-in-use":
          setError("Email is already registered");
          break;
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/weak-password":
          setError("Password is too weak");
          break;
        case "auth/invalid-credential":
          setError("Invalid email or password");
          break;
        default:
          setError(err.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    // Redirect-based OAuth — navigates away from the page
    loginWithGoogle();
  };

  const handleAnonymousSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await loginAnonymously();
      onAuthSuccess?.();
    } catch (err) {
      console.error("Anonymous sign-in error:", err);
      setError("Failed to continue as guest");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setPassword("");
    setConfirmPassword("");
    setTermsAccepted(false);
    setTermsError(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-heart auth-heart-1">💕</div>
        <div className="auth-heart auth-heart-2">💗</div>
        <div className="auth-heart auth-heart-3">💖</div>
        <div className="auth-heart auth-heart-4">💝</div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">💌</div>
            <h1 className="auth-title">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="auth-subtitle">
              {isLogin
                ? "Sign in to create your Valentine"
                : "Join us to spread the love"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label htmlFor="email" className="auth-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className="auth-input-group">
                <label htmlFor="confirmPassword" className="auth-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            )}

            {!isLogin && (
              <>
                <div
                  className={`auth-terms-group${termsError ? " auth-terms-error" : ""}`}
                >
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    className="auth-terms-checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked) setTermsError(false);
                    }}
                    disabled={loading}
                  />
                  <label htmlFor="termsAccepted" className="auth-terms-label">
                    Би{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                      Үйлчилгээний нөхцөл
                    </a>{" "}
                    болон{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Нууцлалын бодлого
                    </a>
                    -г уншиж, зөвшөөрч байна.
                  </label>
                </div>
                {termsError && (
                  <p className="auth-terms-error-msg">
                    ⚠ Үйлчилгээний нөхцөл зөвшөөрөх шаардлагатай
                  </p>
                )}
              </>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-button auth-button-primary"
              disabled={loading || (!isLogin && !termsAccepted)}
            >
              {loading ? (
                <span className="auth-spinner"></span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-social-buttons">
            <button
              type="button"
              className="auth-button auth-button-google"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" className="auth-google-icon">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              className="auth-button auth-button-guest"
              onClick={handleAnonymousSignIn}
              disabled={loading}
            >
              <span className="auth-guest-icon">👤</span>
              Guest
            </button>
          </div>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                className="auth-toggle-button"
                onClick={toggleMode}
                disabled={loading}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
