import { createContext } from "react";
import type { AuthSessionInfo, LoginDto } from "@almacen/shared";

type AuthContextType = {
  session: AuthSessionInfo | null;
  isRestoring: boolean;
  restorationError: string | null;
  signIn: (data: LoginDto) => Promise<void>;
  signOut: () => Promise<void>;
  retrySession: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
