/**
 * React context that holds the current authenticated user.
 * Wraps the entire app so any component can access auth state.
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type User, getMe, logout as logoutService } from "../../lib/auth.service";
import { getToken, removeToken } from "../../lib/api-client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Refresh user from /auth/me */
  refresh: () => Promise<void>;
  /** Set user directly (after login/register) */
  setUser: (user: User | null) => void;
  /** Logout and clear state */
  logout: () => void;
  /** Convenience booleans */
  isAuthenticated: boolean;
  isCreator: boolean;
  isBrand: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refresh,
        setUser,
        logout,
        isAuthenticated: !!user,
        isCreator: user?.role === "creator",
        isBrand: user?.role === "brand",
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
