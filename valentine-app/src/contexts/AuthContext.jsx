import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthChange,
  loginAnonymously,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logout,
} from "../services/authService";

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

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto sign in anonymously if no user (optional - for Valentine app)
  const signInAnonymouslyIfNeeded = async () => {
    if (!user) {
      try {
        await loginAnonymously();
      } catch (error) {
        console.error("Anonymous sign in failed:", error);
      }
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous ?? false,
    signInAnonymouslyIfNeeded,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginAnonymously,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
