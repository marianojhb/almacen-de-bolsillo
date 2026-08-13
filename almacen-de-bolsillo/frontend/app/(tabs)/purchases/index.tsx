import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Keyboard, Pressable, Text, TextInput, View, RefreshControl } from "react-native";
import { usePurchases } from "@/contexts/purchases";

const PurchasesScreen = () => {
  const { purchases, totalPurchases, isLoadingPurchases, errorPurchases } = usePurchases();
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredPurchases = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    if (normalizedSearchText.length === 0) {
      return purchases;
    }

    return purchases.filter((purchase) => {
      return [`compra ${purchase.id}`, `#${purchase.id}`]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearchText));
    });
  }, [purchases, searchText]);

  if (isLoadingPurchases) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando compras...</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Estamos preparando tus órdenes de compra.
          </Text>
        </View>
      </View>
    );
  }

  if (errorPurchases) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-red-100 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
          <Text className="text-center text-xl font-bold text-red-700 dark:text-red-300">
            No pudimos cargar las compras
          </Text>
          <Text className="mt-2 text-center text-sm text-red-600 dark:text-red-200">{errorPurchases}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-slate-50 px-4 pt-4 dark:bg-[#071111]"
      onStartShouldSetResponderCapture={() => {
        if (isSearchFocused) {
          Keyboard.dismiss();
        }

        return false;
      }}>
      <View className="mb-4 rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Abastecimiento</Text>
            <Text className="mt-1 text-4xl font-black text-white">Compras</Text>
            <Text className="mt-2 text-sm leading-5 text-slate-300">
              {filteredPurchases.length} de {purchases.length} compras visibles · Total{" "}
              {Number(totalPurchases).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
            </Text>
          </View>

          <Pressable
            className="min-w-[132px] rounded-2xl bg-white/10 px-4 py-3 active:opacity-80"
            onPress={() => {
              Keyboard.dismiss();
              router.push("/(tabs)/purchases/new");
            }}>
            <Text className="text-center text-sm font-black uppercase tracking-[1px] text-white">Nueva compra</Text>
          </Pressable>
        </View>
      </View>

      <View className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <View className="mb-2 flex-row items-center justify-between gap-3">
          <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
            Buscar
          </Text>
        </View>
        <TextInput
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          placeholder="Filtrar por número de compra"
          placeholderTextColor="#94a3b8"
          keyboardType="default"
          returnKeyType="search"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>

      {purchases.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">No hay compras</Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Registrá tu primera compra para empezar a seguir tu abastecimiento.
            </Text>
          </View>
        </View>
      ) : filteredPurchases.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">
              No encontramos resultados
            </Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Probá con otro número de compra.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredPurchases}
          keyExtractor={(purchase) => purchase.id.toString()}
          contentContainerClassName="gap-3 pb-8"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          renderItem={({ item: purchase }) => (
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                router.push({
                  pathname: "/(tabs)/purchases/[id]",
                  params: { id: String(purchase.id) },
                });
              }}
              className="rounded-3xl active:scale-[0.98] active:opacity-80">
              <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-2xl font-black text-slate-950 dark:text-white">Compra Nº{purchase.id}</Text>
                    <Text className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400" numberOfLines={2}>
                      Orden registrada el{" "}
                      {new Date(purchase.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-xs font-bold uppercase tracking-[1px] text-emerald-600 dark:text-emerald-400">
                      Total
                    </Text>
                    <Text className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                      {Number(purchase.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row flex-wrap gap-2">
                  <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {new Date(purchase.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  <View
                    className={`rounded-full px-3 py-1.5 ${purchase.isActive ? "bg-emerald-50 dark:bg-emerald-950/60" : "bg-slate-100 dark:bg-slate-900"}`}>
                    <Text
                      className={`text-xs font-bold ${
                        purchase.isActive
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-slate-500 dark:text-slate-400"
                      }`}>
                      {purchase.isActive ? "Activa" : "Inactiva"}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

export default PurchasesScreen;
