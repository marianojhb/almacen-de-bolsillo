import { prisma } from "../config/prisma.js";
import { getUserDisplayName } from "@almacen/shared";
import type { Prisma } from "../../../generated/prisma/index.js";
import { ApiError, readBody, readBoolean, readText } from "../auth/request.utils.js";
import { assertProductQuantity } from "../products/products.rules.js";
import { productValuesResponse } from "../products/products.response.js";
import { validateSale } from "./sales.validation.js";

const salesArgs = (commerceId: number) => ({
  include: {
    salesOrderItems: { where: { commerceId, product: { commerceId } }, include: { product: true } },
    seller: { select: { id: true, username: true, firstname: true, lastname: true } },
    transaction: { select: { paymentMethod: true, walletProvider: true } },
  },
} satisfies Prisma.SalesOrderDefaultArgs);

type SaleRecord = Prisma.SalesOrderGetPayload<ReturnType<typeof salesArgs>>;
const saleResponse = ({ transaction, ...order }: SaleRecord) => ({
  ...order, ...transaction,
  seller: { id: order.seller.id, username: order.seller.username, name: getUserDisplayName(order.seller) },
  total: Number(order.total), subtotal: Number(order.subtotal), discount: Number(order.discount),
  taxableBase: Number(order.taxableBase), ivaSales: Number(order.ivaSales),
  salesOrderItems: order.salesOrderItems.map((item) => ({
    ...item, quantity: Number(item.quantity), price: Number(item.price), discount: Number(item.discount),
    subtotal: Number(item.subtotal), product: productValuesResponse(item.product),
  })),
});

const getSalesOrdersFromDatabase = (commerceId: number) =>
  prisma.salesOrder.findMany({ ...salesArgs(commerceId), where: { commerceId }, orderBy: { createdAt: "desc" } }).then((orders) => orders.map(saleResponse));

const getSalesOrderByIdFromDatabase = (id: number, commerceId: number) =>
  prisma.salesOrder.findUnique({ ...salesArgs(commerceId), where: { id, commerceId } }).then((order) => order ? saleResponse(order) : null);

const postSalesOrderToDatabase = async (body: unknown, commerceId: number, sellerId: number) => {
  const { items, paymentMethod, walletProvider, ...fields } = validateSale(body);
  return prisma.$transaction(async (tx) => {
    await tx.user.findUniqueOrThrow({ where: { id: sellerId, commerceId, isActive: true }, select: { id: true } });
    // Orden estable de bloqueos, compartido con compras y ajustes.
    for (const id of items.map((item) => item.productId).sort((a, b) => a - b)) {
      await tx.$queryRaw`SELECT "id_product_p" FROM "products_p" WHERE "id_product_p" = ${id} AND "id_commerce_p" = ${commerceId} FOR UPDATE`;
    }
    const products = await tx.product.findMany({ where: { id: { in: items.map((item) => item.productId) }, commerceId, isActive: true } });
    if (products.length !== items.length) throw new ApiError(400, "Uno o más productos no pertenecen a este comercio o están inactivos.");
    const productsById = new Map(products.map((product) => [product.id, product]));
    for (const item of items) {
      const product = productsById.get(item.productId)!;
      assertProductQuantity(item.quantity, product.measurementUnit);
      if (product.stock.lessThan(item.quantity)) throw new ApiError(409, "Stock insuficiente. Actualizá los productos.");
    }
    const transaction = await tx.transaction.create({ data: { commerceId, amount: fields.total, paymentMethod, walletProvider, direction: "INCOME" } });
    const order = await tx.salesOrder.create({ data: { ...fields, commerceId, sellerId, transactionId: transaction.id } });
    await tx.salesOrderItem.createMany({ data: items.map((item) => {
      const product = productsById.get(item.productId)!;
      return { ...item, commerceId, salesOrderId: order.id, measurementUnit: product.measurementUnit, shortname: product.shortname, longname: product.longname };
    }) });
    for (const item of items) {
      const product = productsById.get(item.productId)!;
      const newStock = product.stock.minus(item.quantity);
      await tx.product.update({ where: { id: product.id, commerceId }, data: { stock: newStock } });
      await tx.stockMovement.create({ data: {
        commerceId, type: "SALE", productId: product.id, measurementUnit: product.measurementUnit, quantity: -item.quantity,
        previousStock: product.stock, newStock, reason: "Venta #" + order.id, salesOrderId: order.id,
      } });
    }
    return saleResponse(await tx.salesOrder.findUniqueOrThrow({ where: { id: order.id, commerceId }, ...salesArgs(commerceId) }));
  });
};

const updateSalesOrderFromDatabase = (id: number, body: unknown, commerceId: number) => {
  const source = readBody(body, ["invoice", "isActive"]);
  return prisma.salesOrder.update({
    where: { id, commerceId }, ...salesArgs(commerceId),
    data: {
      ...(source.invoice !== undefined && { invoice: readText(source.invoice, "invoice", 255, true) }),
      ...(source.isActive !== undefined && { isActive: readBoolean(source.isActive) }),
    },
  }).then(saleResponse);
};

const deleteSalesOrderFromDatabase = (id: number, commerceId: number) =>
  prisma.salesOrder.delete({ where: { id, commerceId } });

export { getSalesOrdersFromDatabase, getSalesOrderByIdFromDatabase, postSalesOrderToDatabase, updateSalesOrderFromDatabase, deleteSalesOrderFromDatabase };
