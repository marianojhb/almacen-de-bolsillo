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
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Switch,
  Modal,
  FlatList,
} from "react-native";

export type ProductFormValues = {
  // Los valores del formulario se manejan como strings para facilitar la entrada de datos y la validación.
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
  // Los valores del formulario se convierten a los tipos correctos antes de enviarlos al backend.
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
  // Valores iniciales del formulario, si se está editando un producto existente.
  initialValues?: ProductFormValues;

  // Lista de categorías disponibles para seleccionar en el formulario.
  categories?: Category[];

  // Etiqueta del botón de envío del formulario. Por defecto es "Guardar".
  submitLabel?: string;

  // Función para crear una nueva categoría.
  onCreateCategory?: (newCategory: CreateCategoryDto) => Promise<Category>;

  // Función que se llama cuando se envía el formulario. Recibe los valores del formulario validados y
  // convertidos a los tipos correctos.
  onSubmit: (values: ParsedProductFormValues) => void;

  // Función que se llama cuando se cancela el formulario. Por defecto, cierra el formulario sin guardar cambios.
  onCancel: () => void;
};

const inputClassName = "mb-1 h-12 rounded border border-gray-300 px-3 py-0 text-base leading-5 dark:text-white";

export default function ProductForm({
  initialValues,
  categories = [],
  submitLabel,
  onSubmit,
  onCancel,
  onCreateCategory,
}: ProductFormProps) {
  // Estados del formulario

  const [sku, setSku] = useState(initialValues?.sku ?? "");
  const [shortname, setShortname] = useState(initialValues?.shortname ?? "");
  const [longname, setLongname] = useState(initialValues?.longname ?? "");
  const [price, setPrice] = useState(initialValues?.price ?? "");
  const [stock, setStock] = useState(initialValues?.stock ?? "");
  const [stockMin, setStockMin] = useState(initialValues?.stockMin ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);

  // Estados para manejar la creación de nuevas categorías
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Estados para manejar proveedores
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierIds, setSupplierIds] = useState<number[]>([initialValues?.supplierIds ?? []].flat());
  const [isSupplierModalVisible, setIsSupplierModalVisible] = useState(false);

  useEffect(() => {
    // Cargar proveedores al montar el componente
    async function loadSuppliers() {
      try {
        const fetchedSuppliers: Supplier[] = await SuppliersAPI.getSuppliers(false);
        setSuppliers(fetchedSuppliers);
      } catch (error) {
        console.log(error);
      }
    }
    loadSuppliers();
  }, []);

  const handleSubmit = () => {
    // Función que maneja la validación y el envío del formulario. Valida los campos requeridos,
    // verifica los límites de longitud

    if (
      // Validación de campos requeridos
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

    // Validación de campos numéricos y conversión a números
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
      // Envío del formulario al componente padre con los valores validados y convertidos a los tipos correctos.
      // Se envían los valores del formulario al componente padre, asegurando que los campos numéricos sean
      // convertidos a números y que los campos de texto estén correctamente recortados.

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
    // Función que maneja la creación de una nueva categoría. Valida el nombre ingresado, verifica si ya existe
    // una categoría con ese nombre y llama a la función onCreateCategory para crear la categoría.
    // Si la creación es exitosa, actualiza el estado del formulario y cierra el modal de creación de categoría.

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
    // Función que alterna la selección de un proveedor en la lista de IDs de proveedores seleccionados.
    // Si el ID del proveedor ya está en la lista, se elimina; si no está, se agrega.

    setSupplierIds((current) =>
      current.includes(id) ? current.filter((supplierId) => supplierId !== id) : [...current, id],
    );
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        className="flex-1 dark:bg-black"
        contentContainerClassName="flex-grow gap-5 p-2"
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 p-1">
          {/* Campos de entrada del formulario */}
          <>
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
            <View className="mt-3 flex-row justify-between gap-3">
              <Text className="mt-3 text-[14px] font-semibold dark:text-white pb-2">Stock actual</Text>
              <TextInput
                placeholder=""
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
                textAlignVertical="center"
                className={inputClassName + " w-20"}
              />
              <Text className="mt-3 text-[14px] font-semibold dark:text-white pb-2">Stock mínimo</Text>
              <TextInput
                placeholder=""
                value={stockMin}
                onChangeText={setStockMin}
                keyboardType="number-pad"
                textAlignVertical="center"
                className={inputClassName + " w-20"}
              />
            </View>
          </>
          {/* Fin campos de entrada del formulario */}

          {/* Sección de categorías y proveedores */}
          <>
            <Text className="mt-3 text-[14px] font-semibold dark:text-white pb-2">Categoría</Text>

            <View className="flex-flow flex-wrap flex-row justify-start gap-4">
              {categories.map((category) => {
                const isSelected = categoryId === category.id.toString();

                return (
                  <Pressable
                    key={category.id}
                    onPress={() => setCategoryId(category.id.toString())}
                    className={`w-22 px-2 py-1 border rounded-xl items-stretch ${
                      isSelected
                        ? "border-[#111A1A] bg-[#111A1A] dark:bg-white"
                        : "border-gray-300 bg-white dark:bg-black"
                    }`}>
                    <Text
                      className={`text-sm ${isSelected ? "text-white text-base dark:text-black" : "text-black dark:text-white"}`}>
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                className="w-22 px-2 py-1 border rounded-xl items-stretch border-gray-300"
                onPress={() => setIsCategoryModalVisible(true)}>
                <Text className="text-sm text-black dark:text-white">+ Agregar</Text>
              </Pressable>
            </View>

            <View className="py-4">
              <View className="flex flex-row justify-between">
                <Text className="text-[14px] font-semibold dark:text-white pb-2">Proveedores (seleccionar)</Text>
                <Pressable onPress={() => setIsSupplierModalVisible(true)}>
                  <Text className="underline text-black dark:text-white">
                    {supplierIds.length === 0
                      ? "No hay proveedores"
                      : supplierIds.length === 1
                        ? "1 proveedor"
                        : `${supplierIds.length} proveedores`}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
          {/* Fin sección de categorías y proveedores */}

          <View className="flex flex-row justify-between py-4 ">
            <Text className="mt-3 text-[14px] font-semibold dark:text-white pb-2">Estado</Text>
            <Switch className="" value={isActive} onValueChange={setIsActive} />
          </View>

          {/* Botones Cancelar - Guardar */}
          <View className="mt-auto w-full flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="
              flex-1
              items-center 
              justify-center
              rounded-xl 
              border 
              border-gray-300 
              p-4
              active:opacity-60 
              ">
              <Text numberOfLines={1} className="text-base font-semibold text-gray-800 dark:text-white ">
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              className="
              flex-1
              items-center 
              justify-center
              rounded-xl 
              p-4
              bg-[#111A1A] 
              active:opacity-75 
              dark:bg-white 
              ">
              <Text numberOfLines={1} className="text-base font-semibold text-white dark:text-black">
                {submitLabel ?? "Guardar"}
              </Text>
            </Pressable>
          </View>
          {/* Fin sección de Botones Cancelar - Guardar */}
        </View>
      </ScrollView>

      {/* Modal Nueva Categoría */}
      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          <View className="w-full rounded-2xl bg-white p-5 dark:bg-gray-900">
            <Text className="mb-4 text-xl font-bold text-black dark:text-white">Nueva categoría</Text>

            <Text className="mb-2 text-sm font-semibold text-black dark:text-white">Nombre</Text>
            <TextInput
              placeholder="Nombre de categoría"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              className={inputClassName}
            />

            <View className="mt-4 flex-row gap-3">
              <Pressable
                disabled={isCreatingCategory}
                onPress={() => {
                  setNewCategoryName("");
                  setIsCategoryModalVisible(false);
                }}
                className="flex-1 items-center rounded-xl border border-gray-300 px-4 py-3 active:opacity-60">
                <Text className="font-semibold text-black dark:text-white">Cancelar</Text>
              </Pressable>

              <Pressable
                disabled={isCreatingCategory}
                onPress={handleCreateCategory}
                className="flex-1 items-center rounded-xl bg-[#111A1A] px-4 py-3 active:opacity-75 dark:bg-white">
                <Text className="font-semibold text-white dark:text-black">
                  {isCreatingCategory ? "Creando..." : "Crear"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Fin Modal Nueva Categoría */}

      {/* Modal Selección de Proveedores */}
      <Modal
        visible={isSupplierModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSupplierModalVisible(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-4"
          onPress={() => setIsSupplierModalVisible(false)}>
          <Pressable className="w-full rounded-2xl bg-white p-6" onPress={(event) => event.stopPropagation()}>
            <FlatList
              data={suppliers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item: supplier }) => (
                <Pressable
                  onPress={() => toggleSupplier(supplier.id)}
                  className={`mb-2 flex-row items-center justify-between rounded-lg border border-gray-300 px-4 py-3 active:opacity-60`}>
                  <Text
                    className={`text-black dark:text-white ${
                      supplierIds.includes(supplier.id) ? "font-bold" : "font-normal"
                    }`}>
                    {supplierIds.includes(supplier.id) ? "✓" : ""} {supplier.name}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
      {/* Fin Modal Selección de Proveedores */}
    </KeyboardAvoidingView>
  );
}
