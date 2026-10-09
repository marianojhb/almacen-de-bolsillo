import { prisma } from "../config/prisma.js";
import { dashboardSummaryResponse } from "./dashboard.response.js";

const getDashboardSummaryFromDatabase = async (commerceId: number, from: Date, to: Date) => {
  const [sales, purchases, products] = await prisma.$transaction([
    prisma.salesOrder.findMany({
      where: { commerceId, isActive: true, createdAt: { gte: from, lt: to } },
      select: { id: true, createdAt: true, total: true, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseOrder.findMany({
      where: { commerceId, isActive: true, createdAt: { gte: from, lt: to } },
      select: { id: true, createdAt: true, total: true, isActive: true },
    }),
    prisma.product.findMany({
      where: { commerceId, isActive: true, stockMin: { gt: 0 } },
      select: { id: true, shortname: true, stock: true, stockMin: true, isActive: true },
    }),
  ]);
  return dashboardSummaryResponse(sales, purchases, products);
};

export { getDashboardSummaryFromDatabase };
