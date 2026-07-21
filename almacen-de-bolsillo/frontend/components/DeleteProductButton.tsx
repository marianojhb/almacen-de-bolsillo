import { router } from "expo-router";
import { Alert, Pressable, Text } from "react-native";
import { deleteProductRequest } from "@/services/productsApi";
import { useProducts } from "@/contexts/useProducts";
import type { Product } from "@/types/Product";

export default function DeleteProductButton({ id }: { id: string }) {
  const { products, deleteProduct } = useProducts();
  const product = products.find((currentProduct) => currentProduct.id === Number(id));
  const handleDelete = () => {
    Alert.alert("Confirmar eliminación", "¿Estás seguro de que quieres eliminar este producto?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProductRequest(Number(id));
            if (!product) return;
            const deletedProduct: Product = { ...product, isActive: false };
            deleteProduct(deletedProduct);
            router.replace("/(tabs)/products");
          } catch (error) {
            console.error("Error deleting product:", error);
            Alert.alert("No se pudo eliminar", "Intentá nuevamente.");
          }
        },
      },
    ]);
  };
  return (
    <Pressable onPress={handleDelete} className="items-center w-24 rounded-xl bg-red-500 px-4 py-2 active:opacity-75">
      <Text className="text-base font-semibold text-white">Eliminar</Text>
    </Pressable>
  );
}
