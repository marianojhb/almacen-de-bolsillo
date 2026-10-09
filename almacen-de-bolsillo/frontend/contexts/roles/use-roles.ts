import { useContext } from "react";
import { RolesContext } from "./context";

export function useRoles() {
  const context = useContext(RolesContext);
  if (!context) throw new Error("useRoles debe utilizarse dentro de RolesProvider.");
  return context;
}
