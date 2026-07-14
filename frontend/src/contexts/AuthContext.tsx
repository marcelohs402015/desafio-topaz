import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { validateCredentials } from '../services/auth';
import type { AuthCredentials } from '../types/url';

const STORAGE_KEY = 'api-topaz-auth';

interface AuthContextValue {
  credentials: AuthCredentials | null;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredCredentials(): AuthCredentials | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthCredentials;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<AuthCredentials | null>(loadStoredCredentials);

  const value = useMemo<AuthContextValue>(
    () => ({
      credentials,
      isAuthenticated: credentials !== null,
      login: async (nextCredentials) => {
        await validateCredentials(nextCredentials);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextCredentials));
        setCredentials(nextCredentials);
      },
      logout: () => {
        sessionStorage.removeItem(STORAGE_KEY);
        setCredentials(null);
      },
    }),
    [credentials],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
