import { Keyboard, Pressable, ScrollView, Text } from "react-native";

type ProductCategoryFiltersProps = {
  categories: { id: number; name: string }[];
  categoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  lowStockOnly: boolean;
  onLowStockChange: (selected: boolean) => void;
  inactiveOnly: boolean;
  onInactiveChange: (selected: boolean) => void;
  className?: string;
  contentContainerClassName?: string;
};

export function ProductCategoryFilters({
  categories,
  categoryId,
  onCategoryChange,
  lowStockOnly,
  onLowStockChange,
  inactiveOnly,
  onInactiveChange,
  className,
  contentContainerClassName = "gap-2 pr-4",
}: ProductCategoryFiltersProps) {
  const pills = [
    { key: "low-stock", label: "Stock bajo", selected: lowStockOnly, onPress: () => onLowStockChange(!lowStockOnly) },
    ...categories.map((category) => ({
      key: `category-${category.id}`,
      label: category.name,
      selected: categoryId === String(category.id),
      onPress: () => onCategoryChange(categoryId === String(category.id) ? null : String(category.id)),
    })),
    { key: "inactive", label: "Inactivos", selected: inactiveOnly, onPress: () => onInactiveChange(!inactiveOnly) },
  ];

  return (
    <ScrollView
      horizontal
      className={className}
      contentContainerClassName={contentContainerClassName}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {pills.map((pill) => (
        <Pressable
          key={pill.key}
          accessibilityRole="button"
          accessibilityLabel={pill.label}
          accessibilityState={{ selected: pill.selected }}
          onPress={() => { Keyboard.dismiss(); pill.onPress(); }}
          className={`min-h-11 justify-center rounded-full border px-4 py-2 active:opacity-75 ${
            pill.selected
              ? pill.key === "low-stock" || pill.key === "inactive"
                ? "border-amber-500 bg-amber-500 dark:border-amber-400 dark:bg-amber-400"
                : "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
          }`}>
          <Text className={`text-sm font-bold ${pill.selected ? "text-white dark:text-slate-950" : "text-slate-700 dark:text-slate-200"}`}>
            {pill.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
