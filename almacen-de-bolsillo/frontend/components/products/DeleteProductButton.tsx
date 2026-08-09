import { router } from "expo-router";
import { Alert, Pressable, Text } from "react-native";
import { deleteProductRequest } from "@/services/productsApi";
import { useProducts } from "@/contexts/products";

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
            await deleteProduct(product.id);
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
    <Pressable onPress={handleDelete} className="items-center rounded-2xl bg-red-500 px-5 py-3 active:opacity-75">
      <Text className="text-sm font-black text-white">Eliminar</Text>
    </Pressable>
  );
}
