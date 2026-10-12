export const ROLES = [
  "ADMIN",
  "BUSINESS_OWNER",
  "SUPERVISOR",
  "EMPLOYEE",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  BUSINESS_OWNER: "Dueño del comercio",
  SUPERVISOR: "Supervisor",
  EMPLOYEE: "Empleado",
};

export const EMPLOYEE_ROLES = ROLES.filter((role) => role !== "BUSINESS_OWNER");

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export type User = {
  id: number;
  email: string;
  lastAccess: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  role: Role;
};
