import type { CreateEmployeeDto, Employee, UpdateEmployeeDto } from "@almacen/shared";
import { createContext } from "react";

interface EmployeesContextType {
  employees: Employee[];
  isLoadingEmployees: boolean;
  employeesError: string | null;
  refreshEmployees: () => Promise<void>;

  addEmployee: (employee: CreateEmployeeDto) => Promise<Employee>;

  updateEmployee: (employeeId: number, employee: UpdateEmployeeDto) => Promise<Employee>;

  deactivateEmployee: (employeeId: number) => Promise<void>;

  permanentlyDeleteEmployee: (employeeId: number) => Promise<void>;
}

export const EmployeesContext = createContext<EmployeesContextType | undefined>(undefined);