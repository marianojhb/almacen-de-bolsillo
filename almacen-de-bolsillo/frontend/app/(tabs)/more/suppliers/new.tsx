import { router } from "expo-router";
import { Alert } from "react-native";

import SupplierForm from "@/components/suppliers/SupplierForm";
import { useSuppliers } from "@/contexts/suppliers";

export default function NewSupplierScreen() {
  const { addSupplier } =
    useSuppliers();

  return (
    <SupplierForm
      submitLabel="Registrar"
      onCancel={() =>
        router.back()
      }
      onSubmit={async (supplierData) => {
        try {
          const supplier =
            await addSupplier(
              supplierData,
            );

          Alert.alert(
            "Proveedor registrado",
            `${supplier.name} fue registrado correctamente.`,
            [
              {
                text: "Aceptar",
                onPress: () =>
                  router.replace(
                    "/more/suppliers",
                  ),
              },
            ],
          );
        } catch (error) {
          Alert.alert(
            "No se pudo registrar",
            error instanceof Error
              ? error.message
              : "Intentá nuevamente.",
          );
        }
      }}
    />
  );
}