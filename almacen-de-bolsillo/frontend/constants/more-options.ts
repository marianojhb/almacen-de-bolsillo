import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import type { ComponentProps } from "react";

export type MoreOption = {
  id: string;
  title: string;
  description: string;
  href: Href;
  icon: ComponentProps<typeof Ionicons>["name"];
  permission: string;
  ownerOnly?: boolean;
};

export const MORE_OPTIONS: MoreOption[] = [
  { id: "work-shifts", title: "Turnos laborales", description: "Calendario, tipos de jornada y seguimiento",
    href: "/work-shifts" as Href, icon: "calendar-outline", permission: "work_shifts.read", ownerOnly: true },
  { id: "suppliers", title: "Proveedores", description: "Gestionar proveedores del negocio",
    href: "/more/suppliers" as Href, icon: "business-outline", permission: "suppliers.read" },
  { id: "transactions", title: "Transacciones", description: "Consultar transacciones del negocio",
    href: "/more/transactions" as Href, icon: "cash-outline", permission: "transactions.read" },
  { id: "employees", title: "Empleados", description: "Gestionar las fichas de empleados",
    href: "/more/employees" as Href, icon: "people-outline", permission: "employees.read" },
  { id: "users", title: "Usuarios", description: "Gestionar cuentas y acceso al comercio",
    href: "/more/users" as Href, icon: "person-circle-outline", permission: "users.read" },
  { id: "roles", title: "Roles y permisos", description: "Definir las acciones disponibles para cada rol",
    href: "/more/roles" as Href, icon: "shield-checkmark-outline", permission: "roles.read" },
];
