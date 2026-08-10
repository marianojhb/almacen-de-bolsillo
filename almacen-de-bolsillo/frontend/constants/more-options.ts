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
    id: "suppliers",
    title: "Proveedores",
    description:
      "Gestionar proveedores del negocio",
    href: "/more/suppliers" as Href,
    icon: "business-outline",
  },

  
] satisfies MoreOption[];