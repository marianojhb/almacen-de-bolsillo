import { router, useLocalSearchParams } from "expo-router";
import { Alert, Text, View } from "react-native";

import { EmployeeForm } from "@/components/employees";
import { getEmployeeName } from "@/components/employees/employee.utils";
import { useEmployees } from "@/contexts/employees";

export default function EditEmployeeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { employees, isLoadingEmployees, employeesError, updateEmployee } = useEmployees();

  const employee = employees.find((item) => item.id === Number(id));

  if (isLoadingEmployees) {
    return (
      <View className="flex-1 bg-gray-50 p-4 dark:bg-black">
        <Text className="text-lg dark:text-white">
          Cargando empleado...
        </Text>
      </View>
    );
  }

  if (employeesError || !employee) {
    return (
      <View className="flex-1 bg-gray-50 p-4 dark:bg-black">
        <Text className="text-lg text-red-600">
          {employeesError || "Empleado no encontrado."}
        </Text>
      </View>
    );
  }

  return (
    <EmployeeForm
      key={employee.id}
      submitLabel="Guardar cambios"
      initialValues={{
        firstname: employee.firstname ?? "",
        lastname: employee.lastname ?? "",
        dni: employee.dni ?? "",
        cuil: employee.cuil,
        dob: employee.dob ? employee.dob.slice(0, 10) : null,
        salary:
          employee.salary === null ? null : Number(employee.salary),
        jobTitle: employee.jobTitle,        gender: employee.gender,
      }}
      onCancel={() => router.back()}
      onSubmit={async (values) => {
        const updatedEmployee = await updateEmployee(employee.id, values);

        Alert.alert(
          "Empleado actualizado",
          `${getEmployeeName(updatedEmployee)} fue actualizado correctamente.`,
          [
            {
              text: "Aceptar",
              onPress: () => router.back(),
            },
          ],
        );
      }}
    />
  );
}
