import { View, Text } from "react-native";
import type { TransactionDto } from "@almacen/shared";

export function TransactionItem({ transaction }: { transaction: TransactionDto }) {
  return (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
      <View>
        <Text className="text-lg font-semibold">{transaction.id}</Text>
        <Text className="text-gray-500">{new Date(transaction.date).toLocaleDateString()}</Text>
      </View>
      <Text className="text-lg font-semibold">${Number(transaction.amount).toFixed(2)}</Text>
    </View>
  );
}
