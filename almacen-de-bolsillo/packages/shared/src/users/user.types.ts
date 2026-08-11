export type Role = "ADMIN" | "USER" | "BUSINESS_OWNER" | "SUPERVISOR" | "EMPLOYEE";

export type User = {
  id: number;
  username: string;
  email: string;
  lastAccess: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  role: Role;
};
