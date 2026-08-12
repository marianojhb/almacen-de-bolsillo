import { useMemo, useState } from "react";
import { FlatList, Keyboard, RefreshControl, Text, TextInput, View } from "react-native";
import { useTransactions } from "@/contexts/transactions";

export default function TransactionsScreen() {
  const { transactions, isLoadingTransactions, transactionsError, refreshTransactions } = useTransactions();
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const visibleTransactions = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    if (!normalizedSearch) {
      return transactions;
    }

    return transactions.filter((transaction) => {
      return [
        transaction.amount.toString(),
        transaction.type,
        transaction.direction,
        transaction.paymentMethod,
        `#${transaction.id}`,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [searchText, transactions]);

  if (isLoadingTransactions && transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando movimientos...</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Estamos preparando la actividad financiera del negocio.
          </Text>
        </View>
      </View>
    );
  }

  if (transactionsError && transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-red-100 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
          <Text className="text-center text-xl font-bold text-red-700 dark:text-red-300">
            No pudimos cargar los movimientos
          </Text>
          <Text className="mt-2 text-center text-sm text-red-600 dark:text-red-200">{transactionsError}</Text>
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
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Finanzas</Text>
            <Text className="mt-1 text-4xl font-black text-white">Movimientos</Text>
            <Text className="mt-2 text-sm leading-5 text-slate-300">
              {visibleTransactions.length} de {transactions.length} movimientos visibles
            </Text>
            <Text className="mt-2 text-sm leading-5 text-slate-300">
              Total:{" "}
              {Number(transactions.reduce((acc, transaction) => acc + Number(transaction.amount), 0)).toLocaleString(
                "es-AR",
                {
                  style: "currency",
                  currency: "ARS",
                },
              )}
            </Text>
          </View>
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
          placeholder="Filtrar por importe, tipo o medio de pago"
          placeholderTextColor="#94a3b8"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onSubmitEditing={Keyboard.dismiss}
          returnKeyType="search"
        />
      </View>

      {transactionsError && transactions.length > 0 && (
        <View className="mb-4 rounded-3xl border border-red-100 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
          <Text className="text-sm font-bold text-red-700 dark:text-red-300">{transactionsError}</Text>
        </View>
      )}

      {transactions.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">No hay movimientos</Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Cuando registres compras, ventas u otros ajustes, aparecerán acá.
            </Text>
          </View>
        </View>
      ) : visibleTransactions.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">
              No encontramos resultados
            </Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Probá con otro importe, tipo o medio de pago.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={visibleTransactions}
          keyExtractor={(transaction) => transaction.id.toString()}
          contentContainerClassName="gap-3 pb-8"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoadingTransactions} onRefresh={refreshTransactions} />}
          renderItem={({ item: transaction }) => {
            const isIncome = transaction.direction === "INCOME";
            const directionBadgeClass = isIncome
              ? "bg-emerald-50 dark:bg-emerald-950/60"
              : "bg-red-50 dark:bg-red-950/60";
            const directionTextClass = isIncome
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-red-700 dark:text-red-300";
            const paymentMethodLabel =
              transaction.paymentMethod === "EFECTIVO"
                ? "Efectivo"
                : transaction.paymentMethod === "MERCADOPAGO"
                  ? "Mercado Pago"
                  : "Ualá";

            return (
              <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-2xl font-black text-slate-950 dark:text-white">
                      Movimiento #{transaction.id}
                    </Text>
                    <Text className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400" numberOfLines={2}>
                      {new Date(transaction.date).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className={`text-xs font-bold uppercase tracking-[1px] ${directionTextClass}`}>
                      {isIncome ? "Ingreso" : "Egreso"}
                    </Text>
                    <Text className={`text-xl font-black ${directionTextClass}`}>
                      {Number(transaction.amount).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row flex-wrap gap-2">
                  <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">{transaction.type}</Text>
                  </View>
                  <View className={`rounded-full px-3 py-1.5 ${directionBadgeClass}`}>
                    <Text className={`text-xs font-bold ${directionTextClass}`}>{isIncome ? "INCOME" : "EXPENSE"}</Text>
                  </View>
                  <View className="rounded-full bg-indigo-50 px-3 py-1.5 dark:bg-indigo-950/60">
                    <Text className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{paymentMethodLabel}</Text>
                  </View>
                  <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {new Date(transaction.createdAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
