import type { Role } from "../users/user.types.js";

export type AuthUser = {
  id: number;
  email: string;
  role: Role;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export type SetupStatus = {
  ownerExists: boolean;
};