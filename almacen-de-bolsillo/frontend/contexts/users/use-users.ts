import { useContext } from "react";
import { UsersContext } from "./context";

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers debe utilizarse dentro de UsersProvider.");
  return context;
}
