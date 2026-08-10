// Product Form
import { useState, useEffect } from "react";
import * as SuppliersAPI from "@/services/suppliersApi";
import type { Category, CreateCategoryDto, Supplier } from "@almacen/shared";
import {
  Text,
  TextInput,
  Pressable,
  View,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Switch,
  Modal,
  FlatList,
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
  supplierIds: number[];
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
  supplierIds: number[];
};

export type ProductFormProps = {
  initialValues?: ProductFormValues;
  categories?: Category[];
  submitLabel?: string;
  onCreateCategory?: (newCategory: CreateCategoryDto) => Promise<Category>;
  onSubmit: (values: ParsedProductFormValues) => void;
  onCancel: () => void;
};

const inputClassName =
  "h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-0 text-base font-medium leading-5 text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white";
const labelClassName = "mb-2 text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500";

export default function ProductForm({
  initialValues,
  categories = [],
  submitLabel,
  onSubmit,
  onCancel,
  onCreateCategory,
}: ProductFormProps) {
  const [sku, setSku] = useState(initialValues?.sku ?? "");
  const [shortname, setShortname] = useState(initialValues?.shortname ?? "");
  const [longname, setLongname] = useState(initialValues?.longname ?? "");
  const [price, setPrice] = useState(initialValues?.price ?? "");
  const [stock, setStock] = useState(initialValues?.stock ?? "");
  const [stockMin, setStockMin] = useState(initialValues?.stockMin ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierIds, setSupplierIds] = useState<number[]>([initialValues?.supplierIds ?? []].flat());
  const [isSupplierModalVisible, setIsSupplierModalVisible] = useState(false);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const fetchedSuppliers: Supplier[] = await SuppliersAPI.getSuppliers();
        setSuppliers(fetchedSuppliers);
      } catch (error) {
        console.log(error);
      }
    }
    loadSuppliers();
  }, []);

  const handleSubmit = () => {
    if (
      !sku.trim() ||
      !shortname.trim() ||
      !longname.trim() ||
      !price.trim() ||
      !stock.trim() ||
      !stockMin.trim() ||
      !categoryId
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

    const numericPrice = Number(price.trim());
    const numericStock = Number(stock.trim());
    const numericMinimumStock = Number(stockMin.trim());
    const numericCategoryId = Number(categoryId.trim());
    const numericSupplierIds = supplierIds ? supplierIds.map((id) => Number(id)) : [];

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
      supplierIds: numericSupplierIds,
      isActive,
    });
  };

  const handleCreateCategory = async () => {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      Alert.alert("Categoría inválida", "Ingresá un nombre para la categoría.");
      return;
    }

    if (categories.some((category) => category.name.toLowerCase() === trimmedName.toLowerCase())) {
      Alert.alert("Categoría existente", "Ya existe una categoría con ese nombre.");
      return;
    }

    if (!onCreateCategory) {
      Alert.alert("No disponible", "No se configuró la creación de categorías.");
      return;
    }

    try {
      setIsCreatingCategory(true);
      const createdCategory = await onCreateCategory({ name: trimmedName });
      setCategoryId(createdCategory.id.toString());
      setNewCategoryName("");
      setIsCategoryModalVisible(false);
    } catch (error) {
      console.error("Error creating category:", error);
      Alert.alert("Error", "No se pudo crear la categoría.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const toggleSupplier = (id: number) => {
    setSupplierIds((current) =>
      current.includes(id) ? current.filter((supplierId) => supplierId !== id) : [...current, id],
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50 dark:bg-[#071111]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-8 pt-4"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}>
        <View className="rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Inventario</Text>
          <Text className="mt-1 text-3xl font-black text-white">
            {initialValues ? "Editar producto" : "Nuevo producto"}
          </Text>
          <Text className="mt-2 text-sm leading-5 text-slate-300">
            Completá los datos principales, stock, categoría y proveedores asociados.
          </Text>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <Text className="mb-4 text-lg font-black text-slate-950 dark:text-white">Información básica</Text>

          <Text className={labelClassName}>Nombre corto</Text>
          <TextInput
            placeholder="Nombre corto"
            placeholderTextColor="#94a3b8"
            value={shortname}
            onChangeText={setShortname}
            textAlignVertical="center"
            returnKeyType="next"
            className={inputClassName}
          />

          <Text className={`${labelClassName} mt-4`}>Nombre largo</Text>
          <TextInput
            placeholder="Nombre largo"
            placeholderTextColor="#94a3b8"
            value={longname}
            onChangeText={setLongname}
            textAlignVertical="center"
            returnKeyType="next"
            className={inputClassName}
          />

          <Text className={`${labelClassName} mt-4`}>SKU</Text>
          <TextInput
            placeholder="Código SKU"
            placeholderTextColor="#94a3b8"
            value={sku}
            onChangeText={setSku}
            textAlignVertical="center"
            returnKeyType="next"
            className={inputClassName}
          />

          <Text className={`${labelClassName} mt-4`}>Precio</Text>
          <TextInput
            placeholder="Precio"
            placeholderTextColor="#94a3b8"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            textAlignVertical="center"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            className={inputClassName}
          />
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <Text className="mb-4 text-lg font-black text-slate-950 dark:text-white">Stock</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className={labelClassName}>Actual</Text>
              <TextInput
                placeholder="0"
                placeholderTextColor="#94a3b8"
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
                textAlignVertical="center"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                className={inputClassName}
              />
            </View>
            <View className="flex-1">
              <Text className={labelClassName}>Mínimo</Text>
              <TextInput
                placeholder="0"
                placeholderTextColor="#94a3b8"
                value={stockMin}
                onChangeText={setStockMin}
                keyboardType="number-pad"
                textAlignVertical="center"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                className={inputClassName}
              />
            </View>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <Text className="mb-4 text-lg font-black text-slate-950 dark:text-white">Categoría</Text>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = categoryId === category.id.toString();

              return (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(category.id.toString())}
                  className={`rounded-full border px-4 py-2 active:opacity-75 ${
                    isSelected
                      ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  }`}>
                  <Text
                    className={`text-sm font-bold ${isSelected ? "text-white dark:text-[#111A1A]" : "text-slate-700 dark:text-slate-200"}`}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              className="rounded-full border border-dashed border-emerald-300 bg-emerald-50 px-4 py-2 active:opacity-75 dark:border-emerald-800 dark:bg-emerald-950/50"
              onPress={() => setIsCategoryModalVisible(true)}>
              <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-300">+ Agregar</Text>
            </Pressable>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-lg font-black text-slate-950 dark:text-white">Proveedores</Text>
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {supplierIds.length === 0
                  ? "No hay proveedores seleccionados"
                  : supplierIds.length === 1
                    ? "1 proveedor seleccionado"
                    : `${supplierIds.length} proveedores seleccionados`}
              </Text>
            </View>
            <Pressable
              onPress={() => setIsSupplierModalVisible(true)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 active:opacity-75 dark:border-slate-800 dark:bg-slate-900">
              <Text className="text-sm font-black text-slate-950 dark:text-white">Elegir</Text>
            </Pressable>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-black text-slate-950 dark:text-white">Estado</Text>
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isActive ? "Producto activo" : "Producto inactivo"}
              </Text>
            </View>
            <Switch value={isActive} onValueChange={setIsActive} />
          </View>
        </View>

        <View className="mt-2 flex-row gap-3">
          <Pressable
            onPress={onCancel}
            className="flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 active:opacity-60 dark:border-slate-800 dark:bg-slate-950">
            <Text numberOfLines={1} className="text-base font-black text-slate-700 dark:text-white">
              Cancelar
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            className="flex-1 items-center justify-center rounded-2xl bg-[#111A1A] p-4 active:opacity-75 dark:bg-white">
            <Text numberOfLines={1} className="text-base font-black text-white dark:text-[#111A1A]">
              {submitLabel ?? "Guardar"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/60 px-4">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-2xl font-black text-slate-950 dark:text-white">Nueva categoría</Text>
            <Text className="mb-2 mt-5 text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
              Nombre
            </Text>
            <TextInput
              placeholder="Nombre de categoría"
              placeholderTextColor="#94a3b8"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              className={inputClassName}
            />

            <View className="mt-5 flex-row gap-3">
              <Pressable
                disabled={isCreatingCategory}
                onPress={() => {
                  setNewCategoryName("");
                  setIsCategoryModalVisible(false);
                }}
                className="flex-1 items-center rounded-2xl border border-slate-200 px-4 py-3 active:opacity-60 dark:border-slate-800">
                <Text className="font-black text-slate-700 dark:text-white">Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={isCreatingCategory}
                onPress={handleCreateCategory}
                className="flex-1 items-center rounded-2xl bg-[#111A1A] px-4 py-3 active:opacity-75 dark:bg-white">
                <Text className="font-black text-white dark:text-[#111A1A]">
                  {isCreatingCategory ? "Creando..." : "Crear"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isSupplierModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSupplierModalVisible(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/60 px-4"
          onPress={() => setIsSupplierModalVisible(false)}>
          <Pressable
            className="max-h-[70%] w-full rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
            onPress={(event) => event.stopPropagation()}>
            <Text className="mb-4 text-2xl font-black text-slate-950 dark:text-white">Seleccionar proveedores</Text>
            <FlatList
              data={suppliers}
              keyExtractor={(item) => item.id.toString()}
              contentContainerClassName="gap-2"
              ListEmptyComponent={
                <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
                  No hay proveedores disponibles.
                </Text>
              }
              renderItem={({ item: supplier }) => {
                const selected = supplierIds.includes(supplier.id);
                return (
                  <Pressable
                    onPress={() => toggleSupplier(supplier.id)}
                    className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 active:opacity-60 ${
                      selected
                        ? "border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/50"
                        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                    }`}>
                    <Text
                      className={`text-base ${selected ? "font-black text-emerald-700 dark:text-emerald-300" : "font-semibold text-slate-700 dark:text-slate-200"}`}>
                      {supplier.name}
                    </Text>
                    <Text
                      className={`text-lg font-black ${selected ? "text-emerald-600 dark:text-emerald-300" : "text-slate-300 dark:text-slate-700"}`}>
                      {selected ? "✓" : "+"}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
