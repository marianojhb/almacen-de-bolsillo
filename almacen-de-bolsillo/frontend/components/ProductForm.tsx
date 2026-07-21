// Product Form
import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  View,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Switch,
} from "react-native";

export type ProductFormValues = {
  sku: string;
  shortname: string;
  longname: string;
  price: string;
  stock: string;
  stockMin: string;
  categoryId: string;
  isActive: boolean;
};

export type ParsedProductFormValues = {
  sku: string;
  shortname: string;
  longname: string;
  price: number;
  stock: number;
  stockMin: number;
  categoryId: number;
  isActive: boolean;
};
export type ProductFormProps = {
  initialValues?: ProductFormValues;
  submitLabel?: string;
  onSubmit: (values: ParsedProductFormValues) => void;
  onCancel: () => void;
};

const inputClassName = "mb-1 h-12 rounded border border-gray-300 px-3 py-0 text-base leading-5 dark:text-white";

export default function ProductForm({ initialValues, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const [sku, setSku] = useState(initialValues?.sku ?? "");
  const [shortname, setShortname] = useState(initialValues?.shortname ?? "");
  const [longname, setLongname] = useState(initialValues?.longname ?? "");
  const [price, setPrice] = useState(initialValues?.price ?? "");
  const [stock, setStock] = useState(initialValues?.stock ?? "");
  const [stockMin, setStockMin] = useState(initialValues?.stockMin ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);

  const handleSubmit = () => {
    if (
      !sku.trim() ||
      !shortname.trim() ||
      !longname.trim() ||
      !price.trim() ||
      !stock.trim() ||
      !stockMin.trim() ||
      !categoryId.toString().trim() ||
      isActive === null
    ) {
      Alert.alert("Campos incompletos", "Todos los campos son obligatorios.");
      return;
    }
    const trimmedSku = sku.trim();
    if (trimmedSku.length < 3 || trimmedSku.length > 20) {
      Alert.alert("SKU inválido", "El SKU debe tener entre 3 y 20 caracteres.");
      return;
    }
    const trimmedShortName = shortname.trim();
    if (trimmedShortName.length < 3 || trimmedShortName.length > 50) {
      Alert.alert("Nombre corto inválido", "El nombre corto debe tener entre 3 y 50 caracteres.");
      return;
    }
    const trimmedLongName = longname.trim();
    if (trimmedLongName.length < 3 || trimmedLongName.length > 100) {
      Alert.alert("Nombre largo inválido", "El nombre largo debe tener entre 3 y 100 caracteres.");
      return;
    }
    const trimmedCategoryId = categoryId.trim();
    if (trimmedCategoryId.length < 1 || trimmedCategoryId.length > 10) {
      Alert.alert("Categoría inválida", "La categoría debe tener entre 1 y 10 caracteres.");
      return;
    }
    const numericPrice = Number(price.trim());
    const numericStock = Number(stock.trim());
    const numericMinimumStock = Number(stockMin.trim());
    const numericCategoryId = Number(categoryId.trim());

    if (Number.isNaN(numericPrice) || Number.isNaN(numericStock) || Number.isNaN(numericMinimumStock)) {
      Alert.alert("Datos inválidos", "Precio y stock deben contener valores numéricos.");
      return;
    }

    if (numericPrice < 0 || numericStock < 0 || numericMinimumStock < 0) {
      Alert.alert("Datos inválidos", "El precio y las cantidades de stock no pueden ser negativas.");
      return;
    }
    onSubmit({
      sku: trimmedSku,
      shortname: trimmedShortName,
      longname: trimmedLongName,
      price: numericPrice,
      stock: numericStock,
      stockMin: numericMinimumStock,
      categoryId: numericCategoryId,
      isActive: isActive,
    });
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        className="flex-1 dark:bg-black"
        contentContainerClassName="gap-5 p-2"
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 p-1">
          <Text className="mt-1 text-[14px] font-semibold dark:text-white pb-1">Nombre corto</Text>
          <TextInput
            placeholder="Nombre corto"
            value={shortname}
            onChangeText={setShortname}
            textAlignVertical="center"
            className={inputClassName}
          />
          <Text className="mt-1 text-[14px] font-semibold dark:text-white pb-2">Nombre largo</Text>
          <TextInput
            placeholder="Nombre largo"
            value={longname}
            onChangeText={setLongname}
            textAlignVertical="center"
            className={inputClassName}
          />
          <Text className="mt-3 text-[14px] font-semibold dark:text-white pb-2">SKU</Text>
          <TextInput
            placeholder="SKU"
            value={sku}
            onChangeText={setSku}
            textAlignVertical="center"
            className={inputClassName}
          />
          <Text className="mt-3 text-[14px] font-semibold dark:text-white pb-2">Precio</Text>
          <TextInput
            placeholder="Precio"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            textAlignVertical="center"
            className={inputClassName}
          />
          <Text className="mt-3 text-[14px] font-semibold dark:text-white pb-2">Stock actual</Text>
          <TextInput
            placeholder="Stock actual"
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
            textAlignVertical="center"
            className={inputClassName}
          />
          <Text className="mt-3 text-[14px] font-semibold dark:text-white pb-2">Stock mínimo</Text>
          <TextInput
            placeholder="Stock mínimo"
            value={stockMin}
            onChangeText={setStockMin}
            keyboardType="number-pad"
            textAlignVertical="center"
            className={inputClassName}
          />
          <Text className="mt-3 text-[14px] font-semibold dark:text-white pb-2">Categoría</Text>
          <TextInput
            placeholder="Categoría"
            value={categoryId}
            onChangeText={setCategoryId}
            textAlignVertical="center"
            className={inputClassName}
          />
          <View className="flex flex-row justify-between py-4 ">
            <Text className="mt-3 text-[14px] font-semibold dark:text-white pb-2">Estado</Text>
            <Switch className="mb-2" value={isActive} onValueChange={setIsActive} />
          </View>

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
