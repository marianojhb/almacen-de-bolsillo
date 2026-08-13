import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, Text, TextInput, View} from "react-native";

import { useSuppliers } from "@/contexts/suppliers";


type SupplierFilter = | "all" | "active" | "inactive";

const supplierFilters: { value: SupplierFilter;  label: string; }[] = [
  {
    value: "all",
    label: "Todos",
  },
  {
    value: "active",
    label: "Activos",
  },
  {
    value: "inactive",
    label: "Inactivos",
  },
];

function DetailRow({ label, value }: { label: string; value: string | null | undefined; }) {
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold uppercase text-gray-400">
        {label}
      </Text>

      <Text className="mt-1 text-base text-gray-800 dark:text-gray-100">
        {value || "No informado"}
      </Text>
    </View>
  );
}

export default function SuppliersScreen() {
  const { suppliers, isLoadingSuppliers, suppliersError, refreshSuppliers, deleteSupplier, updateSupplier } = useSuppliers();

  const [ search, setSearch ] = useState("");

  const [ supplierFilter, setSupplierFilter ] = useState<SupplierFilter>("active");

  const [ deletingId, setDeletingId ] = useState<number | null>(null);

  const [ reactivatingId, setReactivatingId ] = useState<number | null>(null);

  const [ expandedSupplierIds, setExpandedSupplierIds ] = useState<Set<number>>(() => new Set());

const visibleSuppliers = useMemo(() => {
  const normalizedSearch = search.trim().toLowerCase();

  return suppliers.filter((supplier) => {
    const matchesStatus =
      supplierFilter === "all" ||
      (supplierFilter === "active" &&
        supplier.isActive) ||
      (supplierFilter === "inactive" &&
        !supplier.isActive);

    const matchesSearch =
      !normalizedSearch ||
      supplier.name
        .toLowerCase()
        .includes(normalizedSearch) ||
      supplier.cuit
        ?.toLowerCase()
        .includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });
}, [search, supplierFilter, suppliers]);

  const toggleSupplier = (supplierId: number) => {
    setExpandedSupplierIds((current) => {
      const next = new Set(current);

      if (next.has(supplierId)) {
        next.delete(supplierId);
      } else {
        next.add(supplierId);
      }

      return next;
    });
  };

  const confirmDelete = (supplierId: number, supplierName: string) => {
    Alert.alert(
      "Eliminar proveedor",
      `¿Querés dar de baja a ${supplierName}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Dar de baja",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(supplierId);

              await deleteSupplier(supplierId);

              setExpandedSupplierIds(
                (current) => {
                  const next = new Set(current);

                  next.delete(supplierId);

                  return next;
                },
              );
            } catch (error) {
              Alert.alert(
                "No se pudo eliminar",
                error instanceof Error
                  ? error.message
                  : "Intentá nuevamente.",
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const confirmReactivate = (supplierId: number, supplierName: string) => {
    Alert.alert(
      "Dar de alta proveedor",
      `¿Querés volver a activar a ${supplierName}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Dar de alta",
          onPress: async () => {
            try {
              setReactivatingId(supplierId);

              await updateSupplier(
                supplierId,
                {
                  isActive: true,
                },
              );

              Alert.alert(
                "Proveedor activado",
                `${supplierName} fue dado de alta correctamente.`,
              );
            } catch (error) {
              Alert.alert(
                "No se pudo activar",
                error instanceof Error
                  ? error.message
                  : "Intentá nuevamente.",
              );
            } finally {
              setReactivatingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4 dark:bg-black">
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-bold text-gray-950 dark:text-white">
            Proveedores
          </Text>

          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {visibleSuppliers.length} registrados
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push("/more/suppliers/new")
          }
          className="flex-row items-center gap-2 rounded-xl bg-[#111A1A] px-4 py-3 active:opacity-75 dark:bg-white"
        >
          <Ionicons name="add" size={20} color="#ffffff"/>

          <Text className="font-semibold text-white dark:text-black">
            Nuevo
          </Text>
        </Pressable>
      </View>

      <View className="mb-4 flex-row items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
        <Ionicons name="search-outline" size={20} color="#9ca3af" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o CUIT"
          className="h-12 flex-1 px-3 text-base text-black dark:text-white"
        />
      </View>

      <View className="mb-4 flex-row gap-2">
        { supplierFilters.map((filter) => {
        const isSelected = supplierFilter === filter.value;

        return (
          <Pressable
            key={filter.value}
            onPress={() =>
              setSupplierFilter(filter.value)
            }
            className={`flex-1 items-center rounded-xl border px-3 py-2.5 active:opacity-70 ${
              isSelected
                ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
            }`}
          >
            <Text
              className={`font-semibold ${
                isSelected
                  ? "text-white dark:text-black"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
            {filter.label}
            </Text>
          </Pressable>
        );
      })}
      </View>

      {suppliersError && (
        <View className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 dark:bg-red-950">
          <Text className="text-red-700 dark:text-red-300">
            {suppliersError}
          </Text>
        </View>
      )}

      <FlatList
        data={visibleSuppliers}
        extraData={expandedSupplierIds}
        keyExtractor={(supplier) =>
          supplier.id.toString()
        }
        contentContainerClassName="gap-3 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={isLoadingSuppliers}
            onRefresh={refreshSuppliers}
          />
        }
        ListEmptyComponent={
          isLoadingSuppliers ? (
            <Text className="text-center text-gray-500 dark:text-gray-400">Cargando proveedores...</Text>
          ) : (
            <View className="items-center py-16">
              <Ionicons name="business-outline" size={48} color="#9ca3af" />

              <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
                No se encontraron proveedores
              </Text>
            </View>
          )
        }

        // Tarjeta Principal de Cada Proveedor

        renderItem={({ item: supplier }) => {
          const isDeleting = deletingId === supplier.id;

          const isReactivating = reactivatingId === supplier.id;

          const isChangingStatus = isDeleting || isReactivating;

          const isExpanded = expandedSupplierIds.has(supplier.id);

          return (
            <Pressable
              disabled={isChangingStatus}
              onPress={() =>
                toggleSupplier(supplier.id)
              }
              accessibilityRole="button"
              accessibilityState={{
                expanded: isExpanded,
              }}
              accessibilityLabel={`Mostrar información de ${supplier.name}`}
              className={`rounded-2xl border p-4 active:opacity-80 ${
                supplier.isActive
                  ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                  : "border-gray-400 bg-gray-100 opacity-70 dark:border-gray-600 dark:bg-gray-800"
              } ${
                isChangingStatus
                  ? "opacity-50"
                  : ""
              }`}
            >
              <View className="flex-row items-center">
                <View className="mr-3 flex-1">

                  <View className="flex-row items-center gap-2">
                    <Text className="flex-shrink text-lg font-semibold text-gray-950 dark:text-white">
                      {supplier.name}
                    </Text>

                    <View
                      className={`rounded-full px-2.5 py-1 ${
                        supplier.isActive
                          ? "bg-green-100 dark:bg-green-950"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          supplier.isActive
                            ? "text-green-700 dark:text-green-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {supplier.isActive
                          ? "Activo"
                          : "Inactivo"}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    CUIT:{" "}
                    {supplier.cuit ??
                      "No informado"}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Pressable
                    disabled={isDeleting}
                    onPress={(event) => {
                      event.stopPropagation();

                      router.push({
                        pathname:
                          "/more/suppliers/[id]/edit",
                        params: {
                          id: supplier.id.toString(),
                        },
                      });
                    }}
                    accessibilityLabel={`Editar ${supplier.name}`}
                    className="h-10 w-10 items-center justify-center rounded-xl border border-gray-300 active:opacity-60 dark:border-gray-600"
                  >
                    <Ionicons
                      name="create-outline"
                      size={21}
                      color="#4b5563"
                    />
                  </Pressable>
                  


              {supplier.isActive ? (
                <Pressable
                  disabled={isChangingStatus}
                  onPress={(event) => {
                    event.stopPropagation();
                  
                    confirmDelete(supplier.id, supplier.name);
                  }}
                  accessibilityLabel={`Dar de baja ${supplier.name}`}
                  className="h-10 w-10 items-center justify-center rounded-xl border border-red-300 active:opacity-60"
                >
                  <Ionicons
                    name="arrow-down-circle-outline"
                    size={22}
                    color="#dc2626"
                  />
                </Pressable>
              ) : (
                <Pressable
                  disabled={isChangingStatus}
                  onPress={(event) => {
                    event.stopPropagation();
                  
                    confirmReactivate(supplier.id, supplier.name);
                  }}
                  accessibilityLabel={`Dar de alta ${supplier.name}`}
                  className="h-10 w-10 items-center justify-center rounded-xl border border-green-400 active:opacity-60"
                >
                  <Ionicons
                    name="arrow-up-circle-outline"
                    size={22}
                    color="#16a34a"
                  />
                </Pressable>
              )}
                  
                  <Ionicons
                    name={
                      isExpanded
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={22}
                    color="#9ca3af"
                  />
                </View>
              </View>

              {isExpanded && (
                <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <DetailRow
                    label="Teléfono"
                    value={supplier.phone}
                  />

                  <DetailRow
                    label="Email"
                    value={supplier.email}
                  />

                  <DetailRow
                    label="Dirección"
                    value={supplier.address}
                  />

                  <DetailRow
                    label="Fecha de registro"
                    value={
                      new Date(supplier.createdAt).toLocaleDateString("es-AR")
                    }
                  />
                  <Pressable
                    onPress={(event) => {
                    event.stopPropagation();

                      router.push({
                        pathname:
                          "/more/suppliers/[id]/products",
                        params: {
                          id: supplier.id.toString(),
                        },
                      });
                    }}
                    className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-[#111A1A] px-4 py-3 active:opacity-75 dark:bg-white">
                    <Ionicons name="cube-outline" size={20} color="#ffffff"/>

                    <Text className="font-semibold text-white dark:text-black">
                      Ver productos 
                    </Text>
                  </Pressable>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}