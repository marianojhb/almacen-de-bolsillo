import type { EmployeeGender } from "@almacen/shared";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import type { EmployeeFieldsProps } from "./employee-form.utils";
import { employeeGenderLabels } from "../employee.utils";

type FieldProps = TextInputProps & {
  label: string;
};

function Field({ label, ...props }: FieldProps) {
  return (
  <View>
    <Text className="mb-2 font-semibold text-gray-950 dark:text-white">
      {label}
    </Text>

    <TextInput
      placeholderTextColor="#9ca3af"
      className="h-12 rounded-xl border border-gray-300 bg-white px-3 text-base text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      {...props}
    />
  </View>
  );
}

const genders: EmployeeGender[] = ["M", "F", "OTHER"];

export function EmployeeFields({ values, onChange, disabled }: EmployeeFieldsProps) {
  return (
    <View className="gap-5">
      <Field
        label="Nombre *"
        value={values.firstname}
        onChangeText={(firstname) => onChange({ firstname })}
        placeholder="Nombre"
        autoCapitalize="words"
        editable={!disabled}
      />
      <Field
        label="Apellido *"
        value={values.lastname}
        onChangeText={(lastname) => onChange({ lastname })}
        placeholder="Apellido"
        autoCapitalize="words"
        editable={!disabled}
      />
      <Field
        label="DNI *"
        value={values.dni}
        onChangeText={(dni) => onChange({ dni })}
        placeholder="12345678"
        keyboardType="number-pad"
        editable={!disabled}
      />
      <Field
        label="CUIL"
        value={values.cuil}
        onChangeText={(cuil) => onChange({ cuil })}
        placeholder="20123456789"
        keyboardType="number-pad"
        editable={!disabled}
      />
      <Field
        label="Fecha de nacimiento"
        value={values.dob}
        onChangeText={(dob) => onChange({ dob })}
        placeholder="AAAA-MM-DD"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
      />
      <Field
        label="Puesto"
        value={values.jobTitle}
        onChangeText={(jobTitle) => onChange({ jobTitle })}
        placeholder="Puesto del empleado"
        autoCapitalize="words"
        editable={!disabled}
      />
      <Field
        label="Salario"
        value={values.salary}
        onChangeText={(salary) => onChange({ salary })}
        placeholder="0,00"
        keyboardType="decimal-pad"
        editable={!disabled}
      />
      <Field
        label="PTO"
        value={values.pto}
        onChangeText={(pto) => onChange({ pto })}
        placeholder="Información de licencia"
        editable={!disabled}
      />
      <View>
        <Text className="mb-2 font-semibold text-gray-950 dark:text-white">
          Género
        </Text>
          <View className="flex-row gap-2">
            {genders.map((gender) => {
              const selected = values.gender === gender;

              return (
              <Pressable
                key={gender}
                disabled={disabled}
                onPress={() => onChange({ gender })}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled }}
                className={`flex-1 items-center rounded-xl border px-2 py-3 active:opacity-70 ${
                  selected
                    ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                    : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    selected
                      ? "text-white dark:text-black"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {employeeGenderLabels[gender]}
                </Text>
              </Pressable>
              );
            })}
          </View>
      </View>
  </View>
  );
}