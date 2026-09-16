import { useContext } from "react";

import { EmployeesContext } from "./context";

export function useEmployees() {
  const context = useContext(EmployeesContext);

  if (!context) {
    throw new Error("useEmployees debe utilizarse dentro de EmployeesProvider.");
  }

  return context;
}