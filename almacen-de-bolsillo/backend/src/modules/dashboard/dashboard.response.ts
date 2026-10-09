import type { Prisma } from "../../../generated/prisma/index.js";

type OrderSummary = {
  id: number;
  createdAt: Date;
  total: Prisma.Decimal;
  isActive: boolean;
};

type ProductSummary = {
  id: number;
  shortname: string;
  stock: Prisma.Decimal;
  stockMin: Prisma.Decimal;
  isActive: boolean;
};

export function dashboardSummaryResponse(sales: OrderSummary[], purchases: OrderSummary[], products: ProductSummary[]) {
  const stocks = products.map((product) => ({
    ...product, stock: Number(product.stock), stockMin: Number(product.stockMin),
  }));
  return {
    sales: sales.map((sale) => ({ ...sale, total: Number(sale.total) })),
    purchases: purchases.map((purchase) => ({ ...purchase, total: Number(purchase.total) })),
    products: stocks.filter((product) => product.stock <= product.stockMin),
  };
}
