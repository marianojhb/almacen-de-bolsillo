import type { AuthUser, LoginDto } from "@almacen/shared";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { createOwnerRequest, loginRequest } from "@/services/authApi";

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  createOwner: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const operation = useRef(0);

  const login = useCallback(async (credentials: LoginDto) => {
    const request = ++operation.current;
    const response = await loginRequest(credentials);
    if (request === operation.current) setUser(response.user);
  }, []);

  const createOwner = useCallback(async (credentials: LoginDto) => {
    const request = ++operation.current;
    const response = await createOwnerRequest(credentials);
    if (request === operation.current) setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    operation.current += 1;
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, isAuthenticated: user !== null, login, createOwner, logout }), [user, login, createOwner, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}
