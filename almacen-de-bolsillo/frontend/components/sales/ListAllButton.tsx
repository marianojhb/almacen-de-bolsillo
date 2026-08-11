import { Pressable, Text } from "react-native";

type ListAllButtonProps = {
  showInactiveSalesOrders: boolean;
  onPress: () => void;
};

export function ListAllButton(props: ListAllButtonProps) {
  return (
    <Pressable onPress={props.onPress} className="items-center rounded-xl bg-[#111A1A] px-4 py-2 active:opacity-75">
      <Text className="text-base font-semibold text-white">{props.showInactiveSalesOrders ? "Activos" : "Todos"} </Text>
    </Pressable>
  );
}
