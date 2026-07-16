// Product Form
import { useState } from "react";
import { Text, TextInput, Pressable, View, Alert, KeyboardAvoidingView, ScrollView, Platform } from "react-native";

export type ProductFormValues = {
  sku: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  minimumStock: string;
};

export type ParsedProductFormValues = {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minimumStock: number;
};
export type ProductFormProps = {
  initialValues?: ProductFormValues;
  submitLabel?: string;
  onSubmit: (values: ParsedProductFormValues) => void;
  onCancel: () => void;
};

export function ProductForm({ initialValues, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const [sku, setSku] = useState(initialValues?.sku || "");
  const [name, setName] = useState(initialValues?.name || "");
  const [category, setCategory] = useState(initialValues?.category || "");
  const [price, setPrice] = useState(initialValues?.price || "");
  const [stock, setStock] = useState(initialValues?.stock || "");
  const [minimumStock, setMinimumStock] = useState(initialValues?.minimumStock || "");

  const handleSubmit = () => {
    if (!sku.trim() || !name.trim() || !category.trim() || !price.trim() || !stock.trim() || !minimumStock.trim()) {
      Alert.alert("Campos incompletos", "Todos los campos son obligatorios.");
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);
    const numericMinimumStock = Number(minimumStock);

    if (Number.isNaN(numericPrice) || Number.isNaN(numericStock) || Number.isNaN(numericMinimumStock)) {
      Alert.alert("Datos inválidos", "Precio y stock deben contener valores numéricos.");
      return;
    }

    if (numericPrice < 0 || numericStock < 0 || numericMinimumStock < 0) {
      Alert.alert("Datos inválidos", "El precio y las cantidades de stock no pueden ser negativas.");
      return;
    }
    onSubmit({ sku, name, category, price: numericPrice, stock: numericStock, minimumStock: numericMinimumStock });
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        className="flex-1 dark:bg-black"
        contentContainerClassName="gap-5 p-5"
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 p-4">
          <TextInput
            placeholder="SKU"
            value={sku}
            onChangeText={setSku}
            className="mb-4 rounded border border-gray-300 px-3 py-2 dark:text-white"
          />
          <TextInput
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
            className="mb-4 rounded border border-gray-300 px-3 py-2 dark:text-white"
          />
          <TextInput
            placeholder="Categoría"
            value={category}
            onChangeText={setCategory}
            className="mb-4 rounded border border-gray-300 px-3 py-2 dark:text-white"
          />
          <TextInput
            placeholder="Precio"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            className="mb-4 rounded border border-gray-300 px-3 py-2 dark:text-white"
          />
          <TextInput
            placeholder="Stock actual"
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
            className="mb-4 rounded border border-gray-300 px-3 py-2 dark:text-white"
          />
          <TextInput
            placeholder="Stock mínimo"
            value={minimumStock}
            onChangeText={setMinimumStock}
            keyboardType="number-pad"
            className="mb-4 rounded border border-gray-300 px-3 py-2 dark:text-white"
          />
          <View className="w-full flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="
                 w-[48%]
              items-center 
              justify-center
              rounded-xl 
              border 
              border-gray-300 
              px-4 py-4 
              active:opacity-60 
              ">
              <Text numberOfLines={1} className="text-base font-semibold text-gray-800 dark:text-white ">
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              className="
             w-[48%]
              items-center 
              justify-center
              rounded-xl 
              bg-[#111A1A] 
              px-4 py-4 
              active:opacity-75 
              dark:bg-white 
              ">
              <Text numberOfLines={1} className="text-base font-semibold text-white dark:text-black">
                {submitLabel ?? "Guardar"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
