import { useProducts } from "@/contexts/useProducts";
import { Alert } from "react-native";
import { router, Stack } from "expo-router";
import { ProductForm } from "@/components/ProductForm";

export default function NewProductScreen2() {
  const { addProduct } = useProducts();
  return (
    <>
      <Stack.Screen options={{ title: "Nuevo producto" }} />
      <ProductForm
        submitLabel="Guardar"
        onCancel={() => router.back()}
        onSubmit={(values) => {
          addProduct(values);
          Alert.alert("Producto registrado", `${values.name} fue registrado correctamente.`, [
            { text: "Aceptar", onPress: () => router.back() },
          ]);
        }}
      />
    </>
  );
}
