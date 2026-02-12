import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../firebase";

// Sign in with email and password
export const loginWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Create new user with email and password
export const registerWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign in anonymously (good for Valentine app without requiring login)
export const loginAnonymously = () => {
  return signInAnonymously(auth);
};

// Sign in with Google (redirect-based OAuth flow)
export const loginWithGoogle = () => {
  window.location.href = "/api/auth/google";
};

/**
 * Process the Google OAuth callback.
 * Called once on app startup in main.jsx BEFORE React mounts
 * so that the auth state is already valid.
 */
export const handleGoogleOAuthCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const idToken = params.get("google_id_token");
  const authError = params.get("auth_error");

  if (idToken) {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (err) {
      console.error("Google OAuth sign-in error:", err);
      sessionStorage.setItem(
        "google_auth_error",
        "Google нэвтрэлт амжилтгүй боллоо.",
      );
    }
    // Clean the URL regardless of success/failure
    window.history.replaceState({}, "", window.location.pathname);
  } else if (authError) {
    sessionStorage.setItem("google_auth_error", authError);
    window.history.replaceState({}, "", window.location.pathname);
  }
};

// Sign out
export const logout = () => {
  return signOut(auth);
};

// Auth state observer
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
