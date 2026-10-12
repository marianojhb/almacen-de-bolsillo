import type { SaleSeller } from "@almacen/shared";
import { formatFullName } from "@almacen/shared";
import { Text, View } from "react-native";

export function SellerInfo({ seller, onDark = false }: {
  seller?: SaleSeller | null;
  onDark?: boolean;
}) {
  const employee = seller?.employee;
  const name = formatFullName(employee?.firstname, employee?.lastname)
    || (seller?.role === "BUSINESS_OWNER" ? "Dueño del comercio" : "Nombre no registrado");
  return (
    <View className="mt-3 gap-1">
      <Text className={onDark ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-800 dark:text-slate-100"}>
        Vendedor: {name}
      </Text>
      <Text className={onDark ? "text-sm text-slate-300" : "text-sm text-slate-500 dark:text-slate-400"}>
        {seller?.email ?? "Email no disponible"}
      </Text>
    </View>
  );
}
