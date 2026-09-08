import { router } from "expo-router";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SelectSuppliersScreen() {
  const colorScheme = useColorScheme();
  return (
    <View className="flex-1 p-4">
      <View className="flex-row items-start">
        <Pressable onPress={() => router.back()} className="mr-3 pt-2">
          <Ionicons name="arrow-back" size={24} color={colorScheme === "dark" ? "#9ca3af" : "black"} />
        </Pressable>

        <View className="flex-1 border">
          <Text className="text-base font-bold dark:text-white ">2. Elegir proveedor y cantidades</Text>
          <Text className="mt-1 text-sm text-gray-600">Elegí proveedor para cada producto</Text>
        </View>
      </View>

      {/* 
Hacer un array de los productos preseleccionados y mostrar un listado de los mismos con un select 
para elegir el proveedor y un input para ingresar la cantidad a comprar.
*/}
      <Text>Este es un comentario de ejemplo</Text>

      <View className="flex-1  bg-slate-50 px-6 dark:bg-[#071111]">
        <Text>Seleccionar Proveedores</Text>
        <Text>1. Provededor 1</Text>
        <Text>1. Provededor 2</Text>
        <Text>1. Provededor 3</Text>
        <Text>1. Provededor 1</Text>

        <View className="flex-column border mt-auto ">
          <Pressable
            className="w-44 ms-auto mt-4 rounded-lg bg-green-800 p-3 items-center"
            onPress={() => router.push("/(tabs)/purchases/new/review")}>
            <Text className="text-white font-bold">
              Continuar <Ionicons name="arrow-forward" size={18} color="white" />
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
