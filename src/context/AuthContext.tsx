import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthSession, UserRole } from "../types";
import { getTokenExpiryMs, isTokenExpired } from "../utils/jwt";

const STORAGE_KEY = "bnb.auth.session";

function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (isTokenExpired(parsed.token)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (session: AuthSession) => void;
  logout: () => void;
  sessionExpiredNotice: boolean;
  dismissExpiredNotice: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  const login = useCallback((next: AuthSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    setSessionExpiredNotice(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  // Proactively log out when the token expires instead of waiting on a 401.
  // This matters a lot for guest sessions: the backend currently issues
  // guest tokens with only a ~60 second lifetime (see guest.controller.ts),
  // so this timer is what keeps the UI honest about being signed out.
  useEffect(() => {
    if (!session) return;
    const expiryMs = getTokenExpiryMs(session.token);
    if (expiryMs === null) return;

    const msRemaining = expiryMs - Date.now();
    if (msRemaining <= 0) {
      logout();
      setSessionExpiredNotice(true);
      return;
    }

    const timer = window.setTimeout(() => {
      logout();
      setSessionExpiredNotice(true);
    }, msRemaining);

    return () => window.clearTimeout(timer);
  }, [session, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      role: session?.role ?? null,
      login,
      logout,
      sessionExpiredNotice,
      dismissExpiredNotice: () => setSessionExpiredNotice(false),
    }),
    [session, login, logout, sessionExpiredNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
