import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { createBalanceRequest, getBalancesRequest } from "@/services/balancesApi";
import { useAuth } from "@/contexts/AuthContext";
import { getSalesOrdersRequest } from "@/services/salesApi";
import { getTransactionsRequest } from "@/services/transactionsApi";
import { calculateCashClosing, createCashMovementBalance, type CashMovementType } from "@/utils/cash-closing";

type ClosingSummary = ReturnType<typeof calculateCashClosing>;

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const periodFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

function AmountRow({ label, value, emphasis = false }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <View className="flex-row items-center justify-between gap-4 py-3">
      <Text className={`flex-1 text-sm ${emphasis ? "font-black text-slate-950 dark:text-white" : "font-semibold text-slate-600 dark:text-slate-300"}`}>
        {label}
      </Text>
      <Text
        selectable
        className={`text-right ${emphasis ? "text-lg font-black text-slate-950 dark:text-white" : "text-sm font-black text-slate-900 dark:text-slate-100"}`}>
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

export default function CashClosingScreen() {
  const { user } = useAuth();
  const isOwner = user?.role === "BUSINESS_OWNER";
  const [summary, setSummary] = useState<ClosingSummary | null>(null);
  const [actualClosingText, setActualClosingText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMovementModalVisible, setIsMovementModalVisible] = useState(false);
  const [movementType, setMovementType] = useState<CashMovementType>("cashIn");
  const [movementAmountText, setMovementAmountText] = useState("");
  const [isSavingMovement, setIsSavingMovement] = useState(false);
  const [movementError, setMovementError] = useState<string | null>(null);

  const loadClosing = useCallback(async () => {
    const snapshotTime = new Date();

    try {
      const [balances, sales, transactions] = await Promise.all([
        getBalancesRequest(),
        getSalesOrdersRequest(),
        getTransactionsRequest(),
      ]);

      setSummary(calculateCashClosing({ now: snapshotTime, balances, sales, transactions }));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos del cierre.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // The request synchronizes this screen with the server when the route mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadClosing();
  }, [loadClosing]);

  const actualClosing = useMemo(() => {
    const normalizedValue = actualClosingText.trim().replace(",", ".");
    if (!/^\d+(?:\.\d{0,2})?$/.test(normalizedValue)) return null;
    const value = Number(normalizedValue);
    return Number.isFinite(value) && value >= 0 ? value : null;
  }, [actualClosingText]);

  const difference = summary && actualClosing !== null ? summary.getDifference(actualClosing) : null;
  const movementAmount = useMemo(() => {
    const normalizedValue = movementAmountText.trim().replace(",", ".");
    if (!/^\d+(?:\.\d{0,2})?$/.test(normalizedValue)) return null;
    const value = Number(normalizedValue);
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [movementAmountText]);
  const movementWouldExceedCash = movementType === "cashOut"
    && movementAmount !== null
    && summary !== null
    && movementAmount > summary.expectedClosing;
  const canSaveMovement = movementAmount !== null && !movementWouldExceedCash && !isSavingMovement;

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadClosing();
  };

  const handleSave = async () => {
    if (!summary || actualClosing === null || isSaving) return;
    if (!user) {
      setError("Iniciá sesión para registrar el cierre.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createBalanceRequest({
        userId: user.id,
        date: summary.to.toISOString(),
        opening: summary.opening,
        cashIn: summary.cashSales,
        cashOut: summary.cashExpenses,
        expectedClosing: summary.expectedClosing,
        actualClosing,
        difference: summary.getDifference(actualClosing),
      });
      setIsSaving(false);
      router.replace("/" as Href);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo registrar el cierre. Volvé a intentar.");
      setIsSaving(false);
    }
  };

  const closeMovementModal = () => {
    if (isSavingMovement) return;
    setIsMovementModalVisible(false);
    setMovementAmountText("");
    setMovementError(null);
  };

  const handleSaveMovement = async () => {
    if (!summary || !user || movementAmount === null || !canSaveMovement) return;

    setIsSavingMovement(true);
    setMovementError(null);

    try {
      await createBalanceRequest(createCashMovementBalance({
        userId: user.id,
        now: new Date(),
        currentCash: summary.expectedClosing,
        amount: movementAmount,
        type: movementType,
      }));
      setMovementAmountText("");
      setIsMovementModalVisible(false);
      setIsLoading(true);
      await loadClosing();
    } catch (saveError) {
      setMovementError(saveError instanceof Error ? saveError.message : "No se pudo registrar el movimiento.");
    } finally {
      setIsSavingMovement(false);
    }
  };

  if (isLoading && !summary) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-4 text-base font-bold text-slate-700 dark:text-slate-200">Preparando el arqueo...</Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5 dark:bg-[#071111]">
        <View className="w-full rounded-[28px] border border-red-100 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30">
          <Ionicons name="cloud-offline-outline" size={28} color="#dc2626" />
          <Text className="mt-3 text-xl font-black text-red-800 dark:text-red-200">No pudimos preparar el cierre</Text>
          <Text selectable className="mt-2 text-sm leading-5 text-red-700 dark:text-red-300">
            {error ?? "Revisá la conexión con el servidor y volvé a intentar."}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-5 items-center rounded-2xl bg-red-700 px-4 py-3 active:opacity-80"
            onPress={() => {
              setIsLoading(true);
              void loadClosing();
            }}>
            <Text className="font-black text-white">Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView
      className="flex-1 bg-transparent"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor="#059669" />}
      contentContainerClassName="gap-4 px-4 pb-10 pt-4">
      <View className="overflow-hidden rounded-2xl bg-ink p-5 dark:bg-slate-950">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-emerald-300">Efectivo esperado</Text>
            <Text selectable className="mt-2 text-4xl font-black text-white">
              {formatCurrency(summary.expectedClosing)}
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400">
            <Ionicons name="calculator-outline" size={24} color="#111A1A" />
          </View>
        </View>
        <View className="mt-5 rounded-2xl bg-white/10 px-4 py-3">
          <Text className="text-xs font-semibold text-slate-400">Período incluido</Text>
          <Text selectable className="mt-1 text-sm font-bold text-slate-100">
            {periodFormatter.format(summary.from)} – {periodFormatter.format(summary.to)}
          </Text>
        </View>
      </View>

      {error !== null ? (
        <View className="flex-row items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
          <Ionicons name="alert-circle-outline" size={23} color="#dc2626" />
          <Text selectable className="flex-1 text-sm font-bold leading-5 text-red-700 dark:text-red-300">
            {error} El importe ingresado se conservó para que puedas reintentar.
          </Text>
        </View>
      ) : null}

      <View className="rounded-[26px]  border-slate-200  px-4 py-2 dark:border-slate-800 dark:bg-slate-950">
        <AmountRow label="Fondo inicial" value={summary.opening} />
        <View className="h-px bg-slate-100 dark:bg-slate-800" />
        <AmountRow label="Ventas en efectivo" value={summary.cashSales} />
        <View className="h-px bg-slate-100 dark:bg-slate-800" />
        <AmountRow label="Gastos en efectivo" value={-summary.cashExpenses} />
        <View className="h-px bg-slate-200 dark:bg-slate-700" />
        <AmountRow label="Total esperado" value={summary.expectedClosing} emphasis />
      </View>

      <View className="rounded-[26px]  border-slate-200  p-4 dark:border-slate-800 dark:bg-slate-950">
        <Text className="text-lg font-black text-slate-950 dark:text-white">Cobros digitales</Text>
        <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">Se informan por separado y no modifican la caja.</Text>
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl  p-3 dark:bg-sky-950/30">
            <Text className="text-xs font-bold text-sky-700 dark:text-sky-300">Mercado Pago</Text>
            <Text selectable className="mt-2 text-base font-black text-sky-950 dark:text-sky-100">
              {formatCurrency(summary.mercadoPagoSales)}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl  p-3 dark:bg-violet-950/30">
            <Text className="text-xs font-bold text-violet-700 dark:text-violet-300">Ualá</Text>
            <Text selectable className="mt-2 text-base font-black text-violet-950 dark:text-violet-100">
              {formatCurrency(summary.ualaSales)}
            </Text>
          </View>
        </View>
      </View>

      <View className="rounded-[26px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <Text className="text-lg font-black text-slate-950 dark:text-white">Contá el efectivo</Text>
        <Text className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
          Ingresá el total real disponible en caja.
        </Text>
        <TextInput
          accessibilityLabel="Efectivo real"
          className="mt-4 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-2xl font-black text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          keyboardType="decimal-pad"
          placeholder="$ 0,00"
          placeholderTextColor="#94a3b8"
          value={actualClosingText}
          onChangeText={setActualClosingText}
        />
        {actualClosingText.length > 0 && actualClosing === null ? (
          <Text className="mt-2 text-sm font-semibold text-red-600 dark:text-red-300">
            Ingresá un importe válido, positivo y con hasta dos decimales.
          </Text>
        ) : null}

        <View
          className={`mt-4 rounded-2xl p-4 ${
            difference === null
              ? "bg-slate-100 dark:bg-slate-900"
              : difference === 0
                ? "bg-emerald-50 dark:bg-emerald-950/40"
                : "bg-red-50 dark:bg-red-950/40"
          }`}>
          <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">Diferencia</Text>
          <Text
            selectable
            className={`mt-1 text-3xl font-black ${
              difference === null
                ? "text-slate-400 dark:text-slate-500"
                : difference === 0
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300"
            }`}>
            {difference === null ? "—" : formatCurrency(difference)}
          </Text>
          {difference !== null && difference !== 0 ? (
            <Text className="mt-1 text-sm font-semibold text-red-700 dark:text-red-300">
              Revisá el conteo antes de registrar el cierre.
            </Text>
          ) : null}
        </View>

        {isOwner ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Registrar aporte o retiro de efectivo"
            className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border border-emerald-700 px-4 py-4 active:bg-emerald-50 dark:border-emerald-500 dark:active:bg-emerald-950/30"
            onPress={() => {
              setMovementError(null);
              setIsMovementModalVisible(true);
            }}>
            <Ionicons name="swap-vertical-outline" size={20} color="#047857" />
            <Text className="text-base font-black text-emerald-700 dark:text-emerald-300">Aportes y retiros</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: actualClosing === null || isSaving }}
          disabled={actualClosing === null || isSaving}
          className={`mt-4 flex-row items-center justify-center gap-2 rounded-2xl px-4 py-4 ${
            actualClosing === null || isSaving
              ? "bg-slate-300 dark:bg-slate-800"
              : "bg-emerald-700 active:opacity-80 dark:bg-emerald-600"
          }`}
          onPress={() => void handleSave()}>
          {isSaving ? <ActivityIndicator color="white" /> : <Ionicons name="lock-closed-outline" size={19} color="white" />}
          <Text className="text-base font-black text-white">{isSaving ? "Registrando..." : "Registrar cierre"}</Text>
        </Pressable>
      </View>
      </ScrollView>

      {isOwner ? (
        <Modal
          visible={isMovementModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeMovementModal}>
          <KeyboardAvoidingView behavior="padding" className="flex-1 justify-end bg-black/60">
            <View className="rounded-t-[28px] border border-slate-200 bg-white px-5 pb-8 pt-5 dark:border-slate-800 dark:bg-slate-950">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-2xl font-black text-slate-950 dark:text-white">Movimiento de efectivo</Text>
                  <Text className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                    Registrá dinero que ingresa o sale de la caja.
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar movimiento de efectivo"
                  disabled={isSavingMovement}
                  className="h-11 w-11 items-center justify-center rounded-full bg-slate-100 active:opacity-70 dark:bg-slate-900"
                  onPress={closeMovementModal}>
                  <Ionicons name="close" size={22} color="#64748b" />
                </Pressable>
              </View>

              <View className="mt-5 flex-row gap-2">
                {([
                  { type: "cashIn" as const, label: "Aporte", icon: "add-circle-outline" as const },
                  { type: "cashOut" as const, label: "Retiro", icon: "remove-circle-outline" as const },
                ]).map((option) => {
                  const isSelected = movementType === option.type;
                  return (
                    <Pressable
                      key={option.type}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 active:opacity-75 ${
                        isSelected
                          ? "border-emerald-700 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40"
                          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                      onPress={() => {
                        setMovementType(option.type);
                        setMovementError(null);
                      }}>
                      <Ionicons name={option.icon} size={20} color={isSelected ? "#047857" : "#64748b"} />
                      <Text className={`font-black ${isSelected ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-200"}`}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text className="mb-2 mt-5 text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Importe
              </Text>
              <TextInput
                accessibilityLabel="Importe del movimiento"
                autoFocus
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-2xl font-black text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                keyboardType="decimal-pad"
                placeholder="$ 0,00"
                placeholderTextColor="#94a3b8"
                value={movementAmountText}
                onChangeText={(value) => {
                  setMovementAmountText(value);
                  setMovementError(null);
                }}
              />

              <View className="mt-4 rounded-2xl bg-slate-100 p-4 dark:bg-slate-900">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Efectivo esperado</Text>
                  <Text selectable className="font-black text-slate-950 dark:text-white">
                    {formatCurrency(summary.expectedClosing)}
                  </Text>
                </View>
                {movementAmount !== null && !movementWouldExceedCash ? (
                  <View className="mt-2 flex-row items-center justify-between gap-3">
                    <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Saldo resultante</Text>
                    <Text selectable className="font-black text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(summary.expectedClosing + (movementType === "cashIn" ? movementAmount : -movementAmount))}
                    </Text>
                  </View>
                ) : null}
              </View>

              {movementWouldExceedCash ? (
                <Text className="mt-3 text-sm font-semibold text-red-600 dark:text-red-300">
                  El retiro no puede superar el efectivo esperado en caja.
                </Text>
              ) : movementError ? (
                <Text selectable className="mt-3 text-sm font-semibold text-red-600 dark:text-red-300">{movementError}</Text>
              ) : null}

              <View className="mt-5 flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  disabled={isSavingMovement}
                  className="flex-1 items-center rounded-2xl border border-slate-300 px-4 py-4 active:opacity-70 dark:border-slate-700"
                  onPress={closeMovementModal}>
                  <Text className="font-black text-slate-700 dark:text-slate-200">Cancelar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canSaveMovement }}
                  disabled={!canSaveMovement}
                  className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl px-4 py-4 ${
                    canSaveMovement ? "bg-emerald-700 active:opacity-80 dark:bg-emerald-600" : "bg-slate-300 dark:bg-slate-800"
                  }`}
                  onPress={() => void handleSaveMovement()}>
                  {isSavingMovement ? <ActivityIndicator color="white" /> : null}
                  <Text className="font-black text-white">{isSavingMovement ? "Registrando..." : "Registrar"}</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      ) : null}
    </>
  );
}
