import type { CreateBalanceDto, PaymentMethod } from "@almacen/shared";

type BalanceForClosing = {
  id: number;
  date: string;
  actualClosing: number;
};

type SaleForClosing = {
  date: string;
  total: number;
  paymentMethod: PaymentMethod;
  isActive: boolean;
};

type TransactionForClosing = {
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  direction: "INCOME" | "EXPENSE";
};

type CalculateCashClosingInput = {
  now: Date;
  balances: BalanceForClosing[];
  sales: SaleForClosing[];
  transactions: TransactionForClosing[];
};

const toCents = (value: number) => Math.round(Number(value) * 100);
const fromCents = (value: number) => value / 100;

export type CashMovementType = "cashIn" | "cashOut";

type CreateCashMovementBalanceInput = {
  userId: number;
  now: Date;
  currentCash: number;
  amount: number;
  type: CashMovementType;
};

export function createCashMovementBalance({
  userId,
  now,
  currentCash,
  amount,
  type,
}: CreateCashMovementBalanceInput): CreateBalanceDto {
  const amountCents = toCents(amount);
  const currentCashCents = toCents(currentCash);

  if (!Number.isFinite(amount) || amountCents <= 0) {
    throw new Error("El importe debe ser mayor que cero.");
  }

  if (type === "cashOut" && amountCents > currentCashCents) {
    throw new Error("El retiro no puede superar el efectivo esperado en caja.");
  }

  const resultingCashCents = type === "cashIn"
    ? currentCashCents + amountCents
    : currentCashCents - amountCents;
  const resultingCash = fromCents(resultingCashCents);

  return {
    userId,
    date: now.toISOString(),
    opening: fromCents(currentCashCents),
    cashIn: type === "cashIn" ? fromCents(amountCents) : 0,
    cashOut: type === "cashOut" ? fromCents(amountCents) : 0,
    expectedClosing: resultingCash,
    actualClosing: resultingCash,
    difference: 0,
    movementType: "C",
  };
}

const getLatestBalance = (balances: BalanceForClosing[]) =>
  balances.reduce<BalanceForClosing | null>((latest, balance) => {
    const balanceTime = new Date(balance.date).getTime();
    if (!Number.isFinite(balanceTime)) return latest;
    if (!latest || balanceTime > new Date(latest.date).getTime()) return balance;
    return latest;
  }, null);

const sumInCents = <T>(items: T[], getValue: (item: T) => number) =>
  items.reduce((total, item) => total + toCents(getValue(item)), 0);

export function calculateCashClosing({ now, balances, sales, transactions }: CalculateCashClosingInput) {
  const latestBalance = getLatestBalance(balances);
  const from = latestBalance
    ? new Date(latestBalance.date)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fromTime = from.getTime();
  const toTime = now.getTime();

  const belongsToPeriod = (date: string) => {
    const time = new Date(date).getTime();
    if (!Number.isFinite(time) || time > toTime) return false;
    return latestBalance ? time > fromTime : time >= fromTime;
  };

  const activeSales = sales.filter((sale) => sale.isActive && belongsToPeriod(sale.date));
  const cashSalesCents = sumInCents(
  activeSales.filter((sale) => sale.paymentMethod === "EFECTIVO"),
    (sale) => sale.total,
  );
  const mercadoPagoSalesCents = sumInCents(
    activeSales.filter((sale) => sale.paymentMethod === "MERCADOPAGO"),
    (sale) => sale.total,
  );
  const ualaSalesCents = sumInCents(
    activeSales.filter((sale) => sale.paymentMethod === "UALA"),
    (sale) => sale.total,
  );
  const cashExpensesCents = sumInCents(
    transactions.filter(
      (transaction) =>
        transaction.direction === "EXPENSE" &&
        transaction.paymentMethod === "EFECTIVO" &&
        belongsToPeriod(transaction.date),
    ),
    (transaction) => transaction.amount,
  );
  const openingCents = toCents(latestBalance ? latestBalance.actualClosing : 0);
  const expectedClosingCents = openingCents + cashSalesCents - cashExpensesCents;

  return {
    from,
    to: now,
    opening: fromCents(openingCents),
    cashSales: fromCents(cashSalesCents),
    cashExpenses: fromCents(cashExpensesCents),
    mercadoPagoSales: fromCents(mercadoPagoSalesCents),
    ualaSales: fromCents(ualaSalesCents),
    expectedClosing: fromCents(expectedClosingCents),
    getDifference: (actualClosing: number) => fromCents(toCents(actualClosing) - expectedClosingCents),
  };
}
