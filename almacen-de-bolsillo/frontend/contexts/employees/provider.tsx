import type { CreateEmployeeDto, Employee, UpdateEmployeeDto } from "@almacen/shared";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { 
  createEmployeeRequest, 
  deactivateEmployeeRequest, 
  getEmployeesRequest, 
  permanentlyDeleteEmployeeRequest, 
  updateEmployeeRequest 
} from "@/services/employeesApi";

import { EmployeesContext } from "./context";

type Props = {
  children: ReactNode;
};

const sortEmployees = (employees: Employee[]) =>
  [...employees].sort((first, second) => {

    const firstName = first.fullname ?? `${first.lastname ?? ""} ${first.firstname ?? ""}`;

    const secondName = second.fullname ?? `${second.lastname ?? ""} ${second.firstname ?? ""}`;

    return firstName.localeCompare(secondName, "es");
  });

export function EmployeesProvider({children}: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [ isLoadingEmployees, setIsLoadingEmployees ] = useState(true);

  const [ employeesError, setEmployeesError ] = useState<string | null>(null);

  const refreshEmployees = useCallback(async () => {
    try {
      setIsLoadingEmployees(true);
      setEmployeesError(null);

      const response = await getEmployeesRequest();

      setEmployees(sortEmployees(response));
    } catch (error) {
      console.error("Error loading employees:", error);

      setEmployeesError(error instanceof Error ? error.message : "No se pudieron cargar los empleados.");
    } finally {
      setIsLoadingEmployees(false);
    }
  }, []);

  useEffect(() => { 
    void refreshEmployees(); 
  }, [refreshEmployees]);

  const addEmployee = async (employeeData: CreateEmployeeDto) => {
    const employee = await createEmployeeRequest(employeeData);

    setEmployees((current) => sortEmployees([...current, employee]),
    );

    return employee;
  };

  const updateEmployee = async (employeeId: number, employeeData: UpdateEmployeeDto) => {
    const employee = await updateEmployeeRequest( employeeId, employeeData);

    setEmployees((current) => 
      sortEmployees(
        current.map((item) => item.id === employee.id ? employee: item),
      ),
    );

    return employee;
  };

  const deactivateEmployee = async (employeeId: number) => {
    await deactivateEmployeeRequest(employeeId);

    setEmployees((current) =>
      current.map((employee) => 
        employee.id === employeeId ? { 
          ...employee, 
          isActive: false 
        } : employee
      ),
    );
  };

  const permanentlyDeleteEmployee = async (employeeId: number) => {
    await permanentlyDeleteEmployeeRequest(employeeId);

    setEmployees((current) =>
      current.filter((employee) => employee.id !== employeeId),
    );
  };

  return (
    <EmployeesContext.Provider
      value={{
        employees,
        isLoadingEmployees,
        employeesError,
        refreshEmployees,
        addEmployee,
        updateEmployee,
        deactivateEmployee,
        permanentlyDeleteEmployee,
      }}
    >
      {children}
    </EmployeesContext.Provider>
  );
}