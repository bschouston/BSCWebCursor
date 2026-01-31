"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

export interface AuthUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tokenBalance: number;
  isActive: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  refreshToken: () => Promise<string | null>;
  setUserFromLogin: (user: AuthUser, token: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshToken = useCallback(async () => {
    const auth = getFirebaseAuth();
    const firebaseUser = auth?.currentUser;
    if (!firebaseUser) return null;
    const t = await firebaseUser.getIdToken(true);
    setToken(t);
    return t;
  }, []);

  const setUserFromLogin = useCallback((userData: AuthUser, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    setLoading(false);
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const t = await firebaseUser.getIdToken();
        setToken(t);
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ ...data, uid: data.id ?? data.uid });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    refreshToken,
    setUserFromLogin,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
