import { useCommerceFormat } from "@/hooks/use-commerce-format";
import { View, Text } from "react-native";
import type { TransactionDto } from "@almacen/shared";

export function TransactionItem({ transaction }: { transaction: TransactionDto }) {
  const { formatCurrency, formatDate } = useCommerceFormat();
  return (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
      <View>
        <Text className="text-lg font-semibold">{transaction.id}</Text>
        <Text className="text-gray-500">{formatDate(transaction.date)}</Text>
      </View>
      <Text className="text-lg font-semibold">{formatCurrency(transaction.amount)}</Text>
    </View>
  );
}
