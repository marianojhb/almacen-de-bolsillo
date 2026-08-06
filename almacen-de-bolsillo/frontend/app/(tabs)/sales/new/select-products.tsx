import { View, Text, Pressable, FlatList, TextInput } from "react-native";
import { useProducts } from "@/contexts/products";
import { useSaleDraft } from "@/contexts/sale-draft";
import { router } from "expo-router";
import { useState, useMemo } from "react";

export default function SelectProductsModal() {
  const { products, categories } = useProducts();
  const { addItem } = useSaleDraft();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const filteredProducts = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = !categoryId || product.categoryId === Number(categoryId);

      const matchesSearchText =
        normalizedSearchText.length === 0 || product.shortname.toLowerCase().includes(normalizedSearchText);
      return matchesCategory && matchesSearchText;
    });
  }, [categoryId, products, searchText]);

  return (
    <>
      {/* Modal backdrop */}
      <View className="flex-1 justify-start px-2  bg-[rgba(0,0,0,0.6)]">
        {/* Modal content */}
        <View className="w-full max-h-[100%] justify-between rounded-2xl  flex-column   p-4 gap-4 overflow-hidden">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-bold mr-2 text-white pt-2 text-2xl">Agregar productos al carrito</Text>
            <Pressable
              className="rounded-lg p-2 px-3 items-center border-2 border-white "
              onPress={() => {
                router.dismiss();
              }}>
              <Text className="text-white text-base font-bold">X</Text>
            </Pressable>
          </View>
          {/* Filtros de la lista de productos */}
          <View className="flex-row gap-2 items-center">
            <Text className="text-white">Buscar</Text>
            <TextInput
              className="flex-1 border border-white rounded-lg w-32 text-start p-2 text-sm text-white dark:text-black"
              placeholder="Filtrar por nombre"
              placeholderTextColor="#9ca3af"
              keyboardType="default"
              onChangeText={setSearchText}></TextInput>
          </View>
          {/* pildoras */}

          <View>
            <View className="flex-flow flex-wrap flex-row justify-start gap-4 gap-x-8">
              {categories.map((category) => {
                const isSelected = categoryId === category.id.toString();

                return (
                  <Pressable
                    key={category.id}
                    onPress={() => setCategoryId(category.id.toString())}
                    className={`w-22 px-2 py-1 border rounded-xl items-stretch ${
                      isSelected
                        ? "border-[#111A1A] bg-[#111A1A] dark:bg-white"
                        : "border-gray-300 bg-white dark:bg-black"
                    }`}>
                    <Text
                      className={`text-sm ${isSelected ? "text-white text-base dark:text-black" : "text-black dark:text-white"}`}>
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          {/* Render the list of products */}
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: product }) => (
              <View className="flex-row w-full justify-between p-1 py-6 border-b border-gray-300 dark:border-gray-700 items-center  ">
                <Text numberOfLines={3} className="w-36 text-xl text-white dark:text-black">
                  {product.shortname}
                </Text>

                <TextInput
                  className="mx-3 border-2 border-white  rounded-lg h-10 w-16 text-center text-sm text-white dark:text-black"
                  placeholder="Cantidad"
                  value={quantities[product.id]?.toString() || "1"}
                  onChangeText={(text) => {
                    const nextQuantity = Number.parseInt(text, 10) || 0;

                    setQuantities((currentQuantities) => ({
                      ...currentQuantities,
                      [product.id]: nextQuantity,
                    }));
                  }}
                  keyboardType="numeric"></TextInput>
                <Pressable
                  className="bg-green-500 rounded-lg p-4 items-center"
                  onPress={() => {
                    addItem({
                      productId: product.id,
                      quantity: quantities[product.id] ?? 1,
                      shortname: product.shortname,
                      longname: product.longname,
                      price: product.price,
                      discount: 0,
                      subtotal: 0,
                    });
                  }}>
                  <Text className="text-white">Agregar</Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      </View>
    </>
  );
}
