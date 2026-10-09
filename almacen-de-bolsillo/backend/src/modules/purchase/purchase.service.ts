import { prisma } from "../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import { ApiError, readBody, readBoolean } from "../auth/request.utils.js";
import { assertProductQuantity } from "../products/products.rules.js";
import { productValuesResponse } from "../products/products.response.js";
import { validatePurchase } from "./purchases.validation.js";

const purchaseArgs = (commerceId: number) => ({
  include: {
    supplier: { select: { id: true, name: true, isActive: true } },
    purchaseOrdersItems: { where: { commerceId, product: { commerceId } }, include: { product: true } },
    transaction: { select: { paymentMethod: true, walletProvider: true } },
  },
} satisfies Prisma.PurchaseOrderDefaultArgs);

type PurchaseRecord = Prisma.PurchaseOrderGetPayload<ReturnType<typeof purchaseArgs>>;
const purchaseResponse = ({ transaction, ...order }: PurchaseRecord) => ({
  ...order, ...transaction, total: Number(order.total), ivaPurchase: Number(order.ivaPurchase),
  purchaseOrdersItems: order.purchaseOrdersItems.map((item) => ({
    ...item, quantity: Number(item.quantity), price: Number(item.price), discount: Number(item.discount),
    subtotal: Number(item.subtotal), product: productValuesResponse(item.product),
  })),
});

const getPurchaseOrdersFromDatabase = (commerceId: number) =>
  prisma.purchaseOrder.findMany({ ...purchaseArgs(commerceId), where: { commerceId, supplier: { commerceId } }, orderBy: { createdAt: "desc" } }).then((orders) => orders.map(purchaseResponse));

const getPurchaseOrderByIdFromDatabase = (id: number, commerceId: number) =>
  prisma.purchaseOrder.findUnique({ ...purchaseArgs(commerceId), where: { id, commerceId, supplier: { commerceId } } }).then((order) => order ? purchaseResponse(order) : null);

const postPurchaseOrderToDatabase = async (body: unknown, commerceId: number, userId: number) => {
  const { items, supplierId, total, paymentMethod, walletProvider } = validatePurchase(body);
  const productIds = items.map((item) => item.productId);
  return prisma.$transaction(async (tx) => {
    await tx.user.findUniqueOrThrow({ where: { id: userId, commerceId, isActive: true }, select: { id: true } });
    await tx.supplier.findUniqueOrThrow({ where: { id: supplierId, commerceId, isActive: true }, select: { id: true } });
    for (const id of [...productIds].sort((a, b) => a - b)) {
      await tx.$queryRaw`SELECT "id_product_p" FROM "products_p" WHERE "id_product_p" = ${id} AND "id_commerce_p" = ${commerceId} FOR UPDATE`;
    }
    const supplierProducts = await tx.productOnSupplier.findMany({
      where: { commerceId, supplierId, productId: { in: productIds }, product: { commerceId, isActive: true } },
      include: { product: true },
    });
    if (supplierProducts.length !== productIds.length) throw new ApiError(400, "Uno o más productos no están activos o no pertenecen al proveedor de este comercio.");
    const productsById = new Map(supplierProducts.map((relation) => [relation.productId, relation.product]));
    for (const item of items) {
      const product = productsById.get(item.productId)!;
      assertProductQuantity(item.quantity, product.measurementUnit);
      if (product.stock.plus(item.quantity).greaterThan("999999999.999")) throw new ApiError(409, "La compra supera el máximo de stock permitido.");
    }
    const transaction = await tx.transaction.create({ data: { commerceId, amount: total, direction: "EXPENSE", paymentMethod, walletProvider } });
    const order = await tx.purchaseOrder.create({ data: { total, commerceId, supplierId, userId, transactionId: transaction.id } });
    await tx.purchaseOrdersItem.createMany({ data: items.map((item) => ({ ...item, commerceId, purchaseOrderId: order.id, measurementUnit: productsById.get(item.productId)!.measurementUnit })) });
    for (const item of items) {
      const product = productsById.get(item.productId)!;
      const newStock = product.stock.plus(item.quantity);
      await tx.product.update({ where: { id: product.id, commerceId }, data: { stock: newStock } });
      await tx.stockMovement.create({ data: {
        commerceId, type: "PURCHASE", productId: product.id, measurementUnit: product.measurementUnit, quantity: item.quantity,
        previousStock: product.stock, newStock, reason: "Compra #" + order.id, purchaseOrderId: order.id,
      } });
    }
    return purchaseResponse(await tx.purchaseOrder.findUniqueOrThrow({ where: { id: order.id, commerceId }, ...purchaseArgs(commerceId) }));
  });
};

const updatePurchaseOrderFromDatabase = (id: number, body: unknown, commerceId: number) => {
  const source = readBody(body, ["isActive"]);
  return prisma.purchaseOrder.update({ where: { id, commerceId }, ...purchaseArgs(commerceId), data: { isActive: readBoolean(source.isActive) } }).then(purchaseResponse);
};

const deletePurchaseOrderFromDatabase = (id: number, commerceId: number) =>
  prisma.purchaseOrder.delete({ where: { id, commerceId } });

export { getPurchaseOrdersFromDatabase, getPurchaseOrderByIdFromDatabase, postPurchaseOrderToDatabase, updatePurchaseOrderFromDatabase, deletePurchaseOrderFromDatabase };
