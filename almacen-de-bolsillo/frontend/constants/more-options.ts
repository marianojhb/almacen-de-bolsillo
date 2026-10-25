import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import type { ComponentProps } from "react";

export type MoreOption = {
  id: string;
  title: string;
  description: string;
  href: Href;
  icon: ComponentProps<typeof Ionicons>["name"];
};

export const MORE_OPTIONS = [
  {
    id: "cash-closing",
    title: "Cierre de Caja",
    description: "Conciliar el efectivo y registrar el cierre",
    href: "/more/cash-closing" as Href,
    icon: "calculator-outline",
  },
  {
    id: "suppliers",
    title: "Proveedores",
    description: "Gestionar proveedores del negocio",
    href: "/more/suppliers" as Href,
    icon: "business-outline",
  },
  {
    id: "transactions",
    title: "Transacciones",
    description: "Gestionar transacciones del negocio",
    href: "/more/transactions" as Href,
    icon: "cash-outline",
  },
  {
    id: "employees",
    title: "Empleados",
    description: "Gestionar empleados del negocio",
    href: "/more/employees" as Href,
    icon: "people-outline",
  },
  {
  id: "work-shifts",
  title: "Turnos laborales",
  description: "Calendario, seguimiento y jornadas",
  href: "/more/work-shifts" as Href,
  icon: "calendar-outline",
},
] satisfies MoreOption[];
