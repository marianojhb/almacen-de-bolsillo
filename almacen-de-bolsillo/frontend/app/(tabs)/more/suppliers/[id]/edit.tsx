import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { Alert, Text, View } from "react-native";

import SupplierForm from "@/components/suppliers/SupplierForm";
import { useSuppliers } from "@/contexts/suppliers";

export default function EditSupplierScreen() { 
    const { id } =useLocalSearchParams<{ id: string; }>();

  const { suppliers, isLoadingSuppliers, suppliersError, updateSupplier } = useSuppliers();

  const supplier = suppliers.find((item) => item.id === Number(id), );

  if (isLoadingSuppliers) {
    return (
      <View className="flex-1 p-4 dark:bg-black">
        <Text className="text-lg dark:text-white">
          Cargando proveedor...
        </Text>
      </View>
    );
  }

  if (suppliersError) {
    return (
      <View className="flex-1 p-4 dark:bg-black">
        <Text className="text-lg text-red-600">
          {suppliersError}
        </Text>
      </View>
    );
  }

  if (!supplier) {
    return (
      <View className="flex-1 p-4 dark:bg-black">
        <Text className="text-lg dark:text-white">
          Proveedor no encontrado.
        </Text>
      </View>
    );
  }

  return (
    <SupplierForm
      submitLabel="Guardar cambios"
      initialValues={{
        name: supplier.name,
        cuit:
          supplier.cuit ?? "",
        phone: supplier.phone,
        email: supplier.email,
        address:
          supplier.address,
      }}
      
      onCancel={() => router.back() }

      onSubmit={async (values) => {
        try {
          await updateSupplier(
            supplier.id,
            values,
          );

          Alert.alert(
            "Proveedor actualizado",
            `${values.name} fue actualizado correctamente.`,
            [
              {
                text: "Aceptar",
                onPress: () =>
                  router.back(),
              },
            ],
          );
        } catch (error) {
          Alert.alert(
            "No se pudo actualizar",
            error instanceof Error
              ? error.message
              : "Intentá nuevamente.",
          );
        }
      }}
    />
  );
}