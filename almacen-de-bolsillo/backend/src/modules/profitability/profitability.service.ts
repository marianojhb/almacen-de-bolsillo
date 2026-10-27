import type { PaymentMethod, ProfitabilitySummaryDto } from "@almacen/shared";

import { prisma } from "../../config/prisma.js";

type MoneyValue = number | string | { toString(): string };

type ProfitabilityBalance = {
  movementType: string;
  cashIn: MoneyValue;
  cashOut: MoneyValue;
};

type ProfitabilitySale = {
  total: MoneyValue;
  paymentMethod: PaymentMethod;
  isActive: boolean;
};

type SupplierPrice = {
  price: MoneyValue | null;
  pricePerPaq: MoneyValue;
  unitsPerPaq: number | null;
};

type ProductValuation = {
  id: number;
  stock: number;
  suppliers: SupplierPrice[];
};

export type ProfitabilityData = {
  balances: ProfitabilityBalance[];
  sales: ProfitabilitySale[];
  products: ProductValuation[];
};

const toNumber = (value: MoneyValue) => Number(value.toString());
const toCents = (value: number) => Math.round(value * 100);
const fromCents = (value: number) => value / 100;

function getUnitPrice(relation: SupplierPrice): number | null {
  if (relation.price !== null) {
    const price = toNumber(relation.price);
    if (Number.isFinite(price) && price >= 0) return price;
  }

  const packagePrice = toNumber(relation.pricePerPaq);
  const unitsPerPackage = relation.unitsPerPaq ?? 1;
  if (!Number.isFinite(packagePrice) || packagePrice < 0 || unitsPerPackage <= 0) return null;

  return packagePrice / unitsPerPackage;
}

export function calculateProfitability({ balances, sales, products }: ProfitabilityData): ProfitabilitySummaryDto {
  let incomeCents = 0;
  let digitalIncomeCents = 0;
  let expensesCents = 0;
  let contributionsCents = 0;
  let withdrawalsCents = 0;

  for (const balance of balances) {
    const cashOutCents = toCents(toNumber(balance.cashOut));

    if (balance.movementType === "C") {
      contributionsCents += toCents(toNumber(balance.cashIn));
      withdrawalsCents += cashOutCents;
    } else if (balance.movementType === "R") {
      expensesCents += cashOutCents;
    }
  }

  for (const sale of sales) {
    if (!sale.isActive) continue;

    const totalCents = toCents(toNumber(sale.total));
    const isDigitalPayment = sale.paymentMethod === "MERCADOPAGO" || sale.paymentMethod === "UALA";

    if (isDigitalPayment) {
      digitalIncomeCents += totalCents;
    } else if (sale.paymentMethod === "EFECTIVO") {
      incomeCents += totalCents;
    }
  }

  let inventoryValueCents = 0;
  let unvaluedProducts = 0;
  let unvaluedUnits = 0;

  for (const product of products) {
    if (product.stock <= 0) continue;

    const unitPrices = product.suppliers
      .map(getUnitPrice)
      .filter((price): price is number => price !== null);

    if (unitPrices.length === 0) {
      unvaluedProducts += 1;
      unvaluedUnits += product.stock;
      continue;
    }

    inventoryValueCents += toCents(Math.min(...unitPrices) * product.stock);
  }

  const resultCents = incomeCents
    + digitalIncomeCents
    - expensesCents
    - contributionsCents
    + withdrawalsCents
    + inventoryValueCents;

  return {
    income: fromCents(incomeCents),
    digitalIncome: fromCents(digitalIncomeCents),
    expenses: fromCents(expensesCents),
    contributions: fromCents(contributionsCents),
    withdrawals: fromCents(withdrawalsCents),
    inventoryValue: fromCents(inventoryValueCents),
    result: fromCents(resultCents),
    unvaluedProducts,
    unvaluedUnits,
  };
}

export async function getProfitabilityFromDatabase(): Promise<ProfitabilitySummaryDto> {
  const [balances, sales, products] = await Promise.all([
    prisma.balance.findMany({
      select: { movementType: true, cashIn: true, cashOut: true },
    }),
    prisma.salesOrder.findMany({
      select: { total: true, paymentMethod: true, isActive: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        stock: true,
        suppliers: {
          where: { supplier: { isActive: true } },
          select: { price: true, pricePerPaq: true, unitsPerPaq: true },
        },
      },
    }),
  ]);

  return calculateProfitability({ balances, sales, products });
}
