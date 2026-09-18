import type { CreateEmployeeDto } from "@almacen/shared";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import { EmployeeFields } from "./EmployeeFields";
import {
    createEmployeeFormState,
    validateEmployeeForm,
    type EmployeeFormState,
} from "./employee-form.utils";

export type EmployeeFormValues = CreateEmployeeDto;

type EmployeeFormProps = {
    initialValues?: Partial<EmployeeFormValues>;
    submitLabel?: string;
    onSubmit: (values: EmployeeFormValues) => Promise<void>;
    onCancel: () => void;
};

export default function EmployeeForm({ initialValues, submitLabel = "Guardar", onSubmit, onCancel }: EmployeeFormProps) {
    const [values, setValues] = useState(() => createEmployeeFormState(initialValues));

    const [isSaving, setIsSaving] = useState(false);

    const updateValues = (changes: Partial<EmployeeFormState>) => {
        setValues((current) => ({
            ...current,
            ...changes,
        }));
    };

    const handleSubmit = async () => {
        if (isSaving) return;

        const result = validateEmployeeForm(values);

        if (!result.ok) {
            Alert.alert("Revisá los datos", result.message);
            return;
        }

        try {
            setIsSaving(true);
            await onSubmit(result.data);
        } catch (error) {
            Alert.alert(
                "No se pudo guardar",
                error instanceof Error ? error.message : "Intentá nuevamente.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
    <KeyboardAvoidingView
        className="flex-1 bg-gray-50 dark:bg-black"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
    >
        <ScrollView
            className="flex-1"
            contentContainerClassName="gap-5 p-4"
            keyboardShouldPersistTaps="handled"
        >
            <EmployeeFields
                values={values}
                onChange={updateValues}
                disabled={isSaving}
            />

            <View className="mt-4 flex-row gap-3">
                <Pressable
                    disabled={isSaving}
                    onPress={onCancel}
                    className="flex-1 items-center rounded-xl border border-gray-300 p-4 active:opacity-60 dark:border-gray-700"
                >
                    <Text className="font-semibold text-gray-950 dark:text-white">
                        Cancelar
                    </Text>
                </Pressable>
                <Pressable
                    disabled={isSaving}
                    onPress={handleSubmit}
                    className={`flex-1 items-center rounded-xl bg-[#111A1A] p-4 active:opacity-75 dark:bg-white ${
                        isSaving ? "opacity-50" : ""
                    }`}
                >
                    <Text className="font-semibold text-white dark:text-black">
                        {isSaving ? "Guardando..." : submitLabel}
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}