import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";

import { useSuppliers } from "@/contexts/suppliers";

export default function SuppliersScreen() {
  const { suppliers, isLoadingSuppliers, suppliersError, refreshSuppliers, deleteSupplier } = useSuppliers();

  const [search, setSearch] = useState("");

  const [ deletingId,setDeletingId ] = useState<number | null>(null);

  const visibleSuppliers =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      if (!normalizedSearch) {
        return suppliers;
      }

      return suppliers.filter(
        (supplier) =>
          supplier.name
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          supplier.cuit
            ?.toLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [search, suppliers]);

  const confirmDelete = (
    supplierId: number,
    supplierName: string,
  ) => {
    Alert.alert(
      "Eliminar proveedor",
      `¿Querés eliminar a ${supplierName}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(
                supplierId,
              );

              await deleteSupplier(
                supplierId,
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
            router.push(
              "/more/suppliers/new",
            )
          }
          className="flex-row items-center gap-2 rounded-xl bg-[#111A1A] px-4 py-3 active:opacity-75 dark:bg-white"
        >
          <Ionicons
            name="add"
            size={20}
            color="#ffffff"
          />

          <Text className="font-semibold text-white dark:text-black">
            Nuevo
          </Text>
        </Pressable>
      </View>

      <View className="mb-4 flex-row items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
        <Ionicons
          name="search-outline"
          size={20}
          color="#9ca3af"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o CUIT"
          className="h-12 flex-1 px-3 text-base text-black dark:text-white"
        />
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
        keyExtractor={(supplier) =>
          supplier.id.toString()
        }
        contentContainerClassName="gap-3 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={
              isLoadingSuppliers
            }
            onRefresh={
              refreshSuppliers
            }
          />
        }
        ListEmptyComponent={
          !isLoadingSuppliers ? (
            <View className="items-center py-16">
              <Ionicons
                name="business-outline"
                size={48}
                color="#9ca3af"
              />

              <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
                No se encontraron proveedores
              </Text>
            </View>
          ) : null
        }
        renderItem={({
          item: supplier,
        }) => {
          const isDeleting =
            deletingId === supplier.id;

          return (
            <View
              className={`flex-row items-center rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 ${
                isDeleting
                  ? "opacity-50"
                  : ""
              }`}
            >
              <View className="mr-3 flex-1">
                <Text className="text-lg font-semibold text-gray-950 dark:text-white">
                  {supplier.name}
                </Text>

                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  CUIT:{" "}
                  {supplier.cuit ??
                    "No informado"}
                </Text>

                {supplier.phone && (
                  <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {supplier.phone}
                  </Text>
                )}

                {supplier.email && (
                  <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {supplier.email}
                  </Text>
                )}
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  disabled={
                    isDeleting
                  }
                  onPress={() =>
                    router.push({
                      pathname:
                        "/more/suppliers/[id]/edit",
                      params: {
                        id: supplier.id.toString(),
                      },
                    })
                  }
                  className="h-10 w-10 items-center justify-center rounded-xl border border-gray-300 active:opacity-60 dark:border-gray-600"
                  accessibilityLabel={`Editar ${supplier.name}`}
                >
                  <Ionicons
                    name="create-outline"
                    size={21}
                    color="#4b5563"
                  />
                </Pressable>

                <Pressable
                  disabled={
                    isDeleting
                  }
                  onPress={() =>
                    confirmDelete(
                      supplier.id,
                      supplier.name,
                    )
                  }
                  className="h-10 w-10 items-center justify-center rounded-xl border border-red-300 active:opacity-60"
                  accessibilityLabel={`Eliminar ${supplier.name}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={21}
                    color="#dc2626"
                  />
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}