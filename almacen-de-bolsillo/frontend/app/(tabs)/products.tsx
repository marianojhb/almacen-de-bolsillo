import { FlatList, Text, View, Pressable } from "react-native";
import { router } from "expo-router";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  minimumStock: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "Coca-Cola 500 ml",
    price: 1800,
    stock: 12,
    minimumStock: 5,
  },
  {
    id: 2,
    name: "Leche entera",
    price: 1500,
    stock: 3,
    minimumStock: 5,
  },
  {
    id: 3,
    name: "Azúcar 1 kg",
    price: 1300,
    stock: 8,
    minimumStock: 4,
  },
];

export default function ProductsScreen() {
  return (
    // container
    <View className="flex p-4">
      {/* title */}
      <Text className="text-[28px] font-bold mb-4">Productos</Text>

      <FlatList
        data={products}
        keyExtractor={(product) => product.id.toString()}
        renderItem={({ item }) => {
          const hasLowStock = item.stock <= item.minimumStock;

          return (
            <Pressable
              onPress={() => router.push(`/products/${item.id}`)}
              className="rounded-xl bg-white active:scale-[0.98] active:opacity-70">
              {/* productCard */}
              <View className="flex flex-row justify-between items-center p-4 mb-3 border border-[#d4d4d4] rounded-xl">
                {/* product information */}
                <View className="gap-1">
                  {/* productName */}
                  <Text className="text-[17px] font-semibold">{item.name}</Text>
                  {/* productPrice */}
                  <Text className="text-base">${item.price.toLocaleString("es-AR")}</Text>
                  {/* el stock */}
                  <Text>Stock: {item.stock}</Text>
                </View>
                {/* alerta de bajo stock */}
                {hasLowStock && <Text className="font-bold">Stock bajo</Text>}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
