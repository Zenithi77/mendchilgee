import { createContext, useEffect, useState } from 'react';
import { onAuthChange, loginAnonymously, logout } from '../services/authService';

const AuthContext = createContext(null);

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
        console.error('Anonymous sign in failed:', error);
      }
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signInAnonymouslyIfNeeded,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
