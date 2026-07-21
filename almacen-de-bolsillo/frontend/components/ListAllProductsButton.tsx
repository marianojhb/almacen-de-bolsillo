import { Pressable, Text } from "react-native";

type ListAllProductsButtonProps = {
  showInactiveProducts: boolean;
  onPress: () => void;
};

export default function ListAllProductsButton(props: ListAllProductsButtonProps) {
  return (
    <Pressable onPress={props.onPress} className="items-center rounded-xl bg-[#111A1A] px-4 py-2 active:opacity-75">
      <Text className="text-base font-semibold text-white">{props.showInactiveProducts ? "Activos" : "Todos"} </Text>
    </Pressable>
  );
}
