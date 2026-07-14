import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 p-6 justify-center">
      <Text className="text-[28px] font-bold mb-3">Almacén de Bolsillo</Text>

      <Text className="text-base">Sistema de gestión para pequeños comercios.</Text>
    </View>
  );
}
