/**
 * React context that holds the current authenticated user.
 * Wraps the entire app so any component can access auth state.
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, logout as logoutService } from "../../lib/auth.service";
import { getToken, removeToken } from "../../lib/api-client";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
