// Product Form
import { useState, useEffect } from "react";
import * as SuppliersAPI from "@/services/suppliersApi";
import type { Category, CreateCategoryDto, ProductSupplierRelationInput, Supplier } from "@almacen/shared";
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
  supplierRelations?: ProductSupplierRelationFormValues[];
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
  supplierRelations: ProductSupplierRelationInput[];
};

export type ProductFormProps = {
  initialValues?: ProductFormValues;
  categories?: Category[];
  submitLabel?: string;
  onCreateCategory?: (newCategory: CreateCategoryDto) => Promise<Category>;
  onSubmit: (values: ParsedProductFormValues) => void | Promise<void>;
  onCancel: () => void;
};

export type ProductSupplierRelationFormValues = {
  supplierId: number;
  price: string;
  supplierCategory: string;
  unitsPerPaq: string;
  pricePerPaq: string;
  minimumQuantity: string;
  salesTerms: string;
  leadTimeDays: string;
};

const inputClassName =
  "h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-0 text-base font-medium leading-5 text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white";
const labelClassName = "mb-2 text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500";

const emptySupplierRelation = (supplierId: number): ProductSupplierRelationFormValues => ({
  supplierId,
  price: "",
  supplierCategory: "",
  unitsPerPaq: "1",
  pricePerPaq: "",
  minimumQuantity: "1",
  salesTerms: "",
  leadTimeDays: "",
});

const optionalNumber = (value: string) => (value.trim() === "" ? null : Number(value));

const optionalText = (value: string) => {
  const normalizedValue = value.trim();
  return normalizedValue === "" ? null : normalizedValue;
};

export function ProductForm({
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
  const [isSupplierModalVisible, setIsSupplierModalVisible] = useState(false);
  const [supplierRelations, setSupplierRelations] = useState<ProductSupplierRelationFormValues[]>(
    initialValues?.supplierRelations ?? [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const fetchedSuppliers = await SuppliersAPI.getSuppliers();
        setSuppliers(fetchedSuppliers);
      } catch (error) {
        console.log(error);
      }
    }
    loadSuppliers();
  }, []);

  const handleSubmit = async () => {
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

    if (Number.isNaN(numericPrice) || Number.isNaN(numericStock) || Number.isNaN(numericMinimumStock)) {
      Alert.alert("Datos inválidos", "Precio y stock deben contener valores numéricos.");
      return;
    }

    if (numericPrice < 0 || numericStock < 0 || numericMinimumStock < 0) {
      Alert.alert("Datos inválidos", "El precio y las cantidades de stock no pueden ser negativas.");
      return;
    }

    if (!Number.isInteger(numericStock) || !Number.isInteger(numericMinimumStock)) {
      Alert.alert("Datos inválidos", "Las cantidades de stock deben ser números enteros.");
      return;
    }

    const parsedSupplierRelations: ProductSupplierRelationInput[] = [];

    for (const relation of supplierRelations) {
      const pricePerPaq = Number(relation.pricePerPaq.trim());
      const price = optionalNumber(relation.price);
      const unitsPerPaq = optionalNumber(relation.unitsPerPaq);
      const minimumQuantity = optionalNumber(relation.minimumQuantity);
      const leadTimeDays = optionalNumber(relation.leadTimeDays);

      if (!relation.pricePerPaq.trim() || !Number.isFinite(pricePerPaq) || pricePerPaq < 0) {
        Alert.alert("Proveedor incompleto", "Cada proveedor debe tener un precio por paquete válido.");
        return;
      }

      if (
        [price, unitsPerPaq, minimumQuantity, leadTimeDays].some(
          (value) => value !== null && (!Number.isFinite(value) || value < 0),
        )
      ) {
        Alert.alert("Proveedor inválido", "Los importes y cantidades del proveedor deben ser números positivos.");
        return;
      }

      if (
        (unitsPerPaq !== null && !Number.isInteger(unitsPerPaq)) ||
        (leadTimeDays !== null && !Number.isInteger(leadTimeDays))
      ) {
        Alert.alert("Proveedor inválido", "Las unidades por paquete y los días de entrega deben ser enteros.");
        return;
      }

      parsedSupplierRelations.push({
        supplierId: relation.supplierId,
        price,
        supplierCategory: optionalText(relation.supplierCategory),
        unitsPerPaq,
        pricePerPaq,
        minimumQuantity,
        salesTerms: optionalText(relation.salesTerms),
        leadTimeDays,
      });
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        sku: trimmedSku,
        shortname: trimmedShortName,
        longname: trimmedLongName,
        price: numericPrice,
        stock: numericStock,
        stockMin: numericMinimumStock,
        categoryId: numericCategoryId,
        supplierRelations: parsedSupplierRelations,
        isActive,
      });
    } finally {
      setIsSubmitting(false);
    }
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
    const isSelected = supplierRelations.some((relation) => relation.supplierId === id);

    if (isSelected) {
      setSupplierRelations((current) => current.filter((relation) => relation.supplierId !== id));
      return;
    }

    setSupplierRelations((current) => [...current, emptySupplierRelation(id)]);
  };

  const updateSupplierRelation = (
    supplierId: number,
    field: Exclude<keyof ProductSupplierRelationFormValues, "supplierId">,
    value: string,
  ) => {
    setSupplierRelations((current) =>
      current.map((relation) => (relation.supplierId === supplierId ? { ...relation, [field]: value } : relation)),
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
                {supplierRelations.length === 0
                  ? "No hay proveedores seleccionados"
                  : supplierRelations.length === 1
                    ? "1 proveedor seleccionado"
                    : `${supplierRelations.length} proveedores seleccionados`}
              </Text>
            </View>
            <Pressable
              onPress={() => setIsSupplierModalVisible(true)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 active:opacity-75 dark:border-slate-800 dark:bg-slate-900">
              <Text className="text-sm font-black text-slate-950 dark:text-white">Configurar</Text>
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
            onPress={() => void handleSubmit()}
            disabled={isSubmitting}
            className={`flex-1 items-center justify-center rounded-2xl bg-[#111A1A] p-4 active:opacity-75 dark:bg-white ${isSubmitting ? "opacity-50" : ""}`}>
            <Text numberOfLines={1} className="text-base font-black text-white dark:text-[#111A1A]">
              {isSubmitting ? "Guardando..." : (submitLabel ?? "Guardar")}
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
            <Text className="text-2xl font-black text-slate-950 dark:text-white">Proveedores y condiciones</Text>
            <Text className="mb-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
              Seleccionar proveedores es opcional. Cada proveedor conserva sus propios precios y condiciones.
            </Text>
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
                const relation = supplierRelations.find((current) => current.supplierId === supplier.id);
                const selected = relation !== undefined;

                return (
                  <View
                    className={`rounded-2xl border p-4 ${
                      selected
                        ? "border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/50"
                        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                    }`}>
                    <Pressable
                      onPress={() => toggleSupplier(supplier.id)}
                      className="flex-row items-center justify-between active:opacity-60">
                      <Text
                        className={`text-base ${selected ? "font-black text-emerald-700 dark:text-emerald-300" : "font-semibold text-slate-700 dark:text-slate-200"}`}>
                        {supplier.name}
                      </Text>
                      <Text
                        className={`text-lg font-black ${selected ? "text-emerald-600 dark:text-emerald-300" : "text-slate-300 dark:text-slate-700"}`}>
                        {selected ? "✓" : "+"}
                      </Text>
                    </Pressable>

                    {relation && (
                      <View className="mt-4 gap-3 border-t border-emerald-200 pt-4 dark:border-emerald-800">
                        <View>
                          <Text className={labelClassName}>Precio por paquete *</Text>
                          <TextInput
                            className={inputClassName}
                            value={relation.pricePerPaq}
                            onChangeText={(value) => updateSupplierRelation(supplier.id, "pricePerPaq", value)}
                            placeholder="Obligatorio"
                            placeholderTextColor="#94a3b8"
                            keyboardType="decimal-pad"
                          />
                        </View>

                        <View>
                          <Text className={labelClassName}>Precio de costo unitario</Text>
                          <TextInput
                            className={inputClassName}
                            value={relation.price}
                            onChangeText={(value) => updateSupplierRelation(supplier.id, "price", value)}
                            placeholder="Opcional"
                            placeholderTextColor="#94a3b8"
                            keyboardType="decimal-pad"
                          />
                        </View>

                        <View className="flex-row gap-3">
                          <View className="flex-1">
                            <Text className={labelClassName}>Unidades por paquete</Text>
                            <TextInput
                              className={inputClassName}
                              value={relation.unitsPerPaq}
                              onChangeText={(value) => updateSupplierRelation(supplier.id, "unitsPerPaq", value)}
                              placeholder="1"
                              placeholderTextColor="#94a3b8"
                              keyboardType="number-pad"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className={labelClassName}>Compra mínima</Text>
                            <TextInput
                              className={inputClassName}
                              value={relation.minimumQuantity}
                              onChangeText={(value) => updateSupplierRelation(supplier.id, "minimumQuantity", value)}
                              placeholder="1"
                              placeholderTextColor="#94a3b8"
                              keyboardType="decimal-pad"
                            />
                          </View>
                        </View>

                        <View>
                          <Text className={labelClassName}>Categoría del proveedor</Text>
                          <TextInput
                            className={inputClassName}
                            value={relation.supplierCategory}
                            onChangeText={(value) => updateSupplierRelation(supplier.id, "supplierCategory", value)}
                            placeholder="Opcional"
                            placeholderTextColor="#94a3b8"
                          />
                        </View>

                        <View>
                          <Text className={labelClassName}>Condiciones comerciales</Text>
                          <TextInput
                            className={inputClassName}
                            value={relation.salesTerms}
                            onChangeText={(value) => updateSupplierRelation(supplier.id, "salesTerms", value)}
                            placeholder="Opcional"
                            placeholderTextColor="#94a3b8"
                          />
                        </View>

                        <View>
                          <Text className={labelClassName}>Plazo de entrega (días)</Text>
                          <TextInput
                            className={inputClassName}
                            value={relation.leadTimeDays}
                            onChangeText={(value) => updateSupplierRelation(supplier.id, "leadTimeDays", value)}
                            placeholder="Opcional"
                            placeholderTextColor="#94a3b8"
                            keyboardType="number-pad"
                          />
                        </View>

                        <Text
                          className="text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                          onPress={() => toggleSupplier(supplier.id)}>
                          Quitar proveedor
                        </Text>
                      </View>
                    )}
                  </View>
                );
              }}
            />
            <Pressable
              onPress={() => setIsSupplierModalVisible(false)}
              className="mt-4 items-center rounded-2xl bg-[#111A1A] px-4 py-3 active:opacity-75 dark:bg-white">
              <Text className="font-black text-white dark:text-[#111A1A]">Listo</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
