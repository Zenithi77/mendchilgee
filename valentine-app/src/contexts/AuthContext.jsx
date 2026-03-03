import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthChange,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logout,
} from "../services/authService";
import {
  getTermsAgreement,
  saveTermsAgreement,
} from "../services/firestoreService";
import { subscribeToCredits } from "../services/creditService";
import { TERMS_VERSION } from "../legal/terms";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsTermsReaccept, setNeedsTermsReaccept] = useState(false);
  const [credits, setCredits] = useState(0);
  const [role, setRole] = useState(null); // "admin" | null

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);
      // Check terms version for non-anonymous authenticated users
      if (authUser && !authUser.isAnonymous) {
        try {
          const agreement = await getTermsAgreement(authUser.uid);
          if (!agreement || agreement.termsVersion !== TERMS_VERSION) {
            setNeedsTermsReaccept(true);
          } else {
            setNeedsTermsReaccept(false);
          }
        } catch (err) {
          console.error("Error checking terms agreement:", err);
          setNeedsTermsReaccept(false);
        }
      } else {
        setNeedsTermsReaccept(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time credits subscription
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setCredits(0);
      return;
    }

    const unsubscribe = subscribeToCredits(user.uid, (newCredits) => {
      setCredits(newCredits);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time role subscription
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setRole(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "userProfiles", user.uid), (snap) => {
      if (snap.exists()) {
        setRole(snap.data().role || null);
      } else {
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Accept updated terms
  const acceptTerms = async () => {
    if (!user || user.isAnonymous) return;
    try {
      await saveTermsAgreement(user.uid, TERMS_VERSION);
      setNeedsTermsReaccept(false);
    } catch (err) {
      console.error("Error saving terms agreement:", err);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    credits,
    role,
    isAdmin: role === "admin",
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous ?? false,
    needsTermsReaccept,
    acceptTerms,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
