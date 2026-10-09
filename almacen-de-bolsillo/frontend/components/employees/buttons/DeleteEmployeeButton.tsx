import { PermissionGate } from "@/components/auth/PermissionGate";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";
import type { Employee } from "@almacen/shared";
import { useEmployees } from "@/contexts/employees";
import { getEmployeeName } from "../employee.utils";

type Props = {
  employee: Employee;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onDeleted: () => void;
};

export function DeleteEmployeeButton({ employee, disabled, onBusyChange, onDeleted }: Props) {
  const { permanentlyDeleteEmployee } = useEmployees();
  return (
    <PermissionGate permission="employees.delete">
      <DeleteRecordButton name={getEmployeeName(employee)} disabled={disabled} onBusyChange={onBusyChange}
        description="No se puede eliminar un empleado con cuenta vinculada o historial asociado. Si corresponde, desactivalo para conservar sus registros."
        onDelete={async () => { await permanentlyDeleteEmployee(employee.id); onDeleted(); }} />
    </PermissionGate>
  );
}
