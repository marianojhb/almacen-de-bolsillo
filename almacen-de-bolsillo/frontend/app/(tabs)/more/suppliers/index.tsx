import { Ionicons } from "@expo/vector-icons";
import { Permission } from "@/components/auth/Permission";
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
      <Text className="text-xs font-semibold uppercase text-slate-400">
        {label}
      </Text>

      <Text className="mt-1 text-base text-slate-800 dark:text-slate-100">
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
    <View className="flex-1 bg-slate-50 px-4 pt-4 dark:bg-[#071111]">
      <View className="mb-3 rounded-3xl bg-[#111A1A] p-4 dark:bg-slate-950">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-xs font-semibold text-emerald-300">Abastecimiento</Text>
            <Text className="mt-0.5 text-2xl font-black text-white">Proveedores</Text>
            <Text className="mt-1 text-xs leading-5 text-slate-300">
              {visibleSuppliers.length} de {suppliers.length} proveedores visibles
            </Text>
          </View>

          <Permission resource="suppliers" action="create">
            <Pressable
              onPress={() => router.push("/more/suppliers/new")}
              className="flex-row items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 active:opacity-75">
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text className="text-sm font-black text-white">Nuevo</Text>
            </Pressable>
          </Permission>
        </View>
      </View>

      <View className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <Text className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
          Buscar
        </Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o CUIT"
          placeholderTextColor="#94a3b8"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
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
            className={`flex-1 items-center rounded-full border px-3 py-2 active:opacity-70 ${
              isSelected
                ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
            }`}
          >
            <Text
              className={`font-semibold ${
                isSelected
                  ? "text-white dark:text-black"
                  : "text-slate-700 dark:text-slate-200"
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
        contentContainerClassName="gap-2 pb-8"
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
              className={`rounded-3xl border p-4 active:opacity-80 ${
                supplier.isActive
                  ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  : "border-slate-300 bg-slate-100 opacity-70 dark:border-slate-700 dark:bg-slate-900"
              } ${
                isChangingStatus
                  ? "opacity-50"
                  : ""
              }`}
            >
              <View className="flex-row items-center">
                <View className="mr-3 flex-1">

                  <View className="flex-row items-center gap-2">
                    <Text className="flex-shrink text-lg font-black text-slate-950 dark:text-white">
                      {supplier.name}
                    </Text>

                    <View
                      className={`rounded-full px-2.5 py-1 ${
                        supplier.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/60"
                          : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          supplier.isActive
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {supplier.isActive
                          ? "Activo"
                          : "Inactivo"}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    CUIT:{" "}
                    {supplier.cuit ??
                      "No informado"}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Permission resource="suppliers" action="update">
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
                  </Permission>
                  


              {supplier.isActive ? (
                <Permission resource="suppliers" action="delete">
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
                </Permission>
              ) : (
                <Permission resource="suppliers" action="update">
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
                </Permission>
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
                <View className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
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
                  <Permission resource="purchases" action="read">
                    <Pressable
                      accessibilityRole="button"
                      onPress={(event) => {
                        event.stopPropagation();
                        router.push({ pathname: "/more/suppliers/[id]/purchases", params: { id: String(supplier.id) } });
                      }}
                      className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-[#111A1A] px-4 py-3 active:opacity-75 dark:bg-white">
                      <Ionicons name="receipt-outline" size={20} color="#80938A" />
                      <Text className="font-semibold text-white dark:text-black">Ver compras</Text>
                    </Pressable>
                  </Permission>
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
