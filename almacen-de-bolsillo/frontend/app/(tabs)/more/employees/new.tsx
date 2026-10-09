import { router } from "expo-router";
import { Alert } from "react-native";

import { EmployeeForm } from "@/components/employees";
import { formatEmployeeCode, getEmployeeName } from "@/components/employees/employee.utils";
import { useEmployees } from "@/contexts/employees";

export default function NewEmployeeScreen() {
  const { addEmployee } = useEmployees();

  return (
    <EmployeeForm
      submitLabel="Registrar"
      onCancel={() => router.back()}
      onSubmit={async (values) => {
        const employee = await addEmployee(values);

        Alert.alert(
          "Empleado registrado",
          `${getEmployeeName(employee)} fue registrado con el código ${formatEmployeeCode(employee.commerceEmployeeId)}.`,
          [
            {
              text: "Aceptar",
              onPress: () => router.replace("/more/employees"),
            },
          ],
        );
      }}
    />
  );
}
