import { prisma } from "../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import { isValidDecimal, isValidProductQuantity } from "@almacen/shared";
import { ApiError, readBody, readId, readText } from "../auth/request.utils.js";

const movementResponse = <T extends { quantity: { toString(): string }; previousStock: { toString(): string }; newStock: { toString(): string } }>(record: T) => ({
  ...record, quantity: Number(record.quantity), previousStock: Number(record.previousStock), newStock: Number(record.newStock),
});

const movementWhere = (commerceId: number) => ({
  commerceId,
  product: { commerceId },
  AND: [
    { OR: [{ salesOrderId: null }, { salesOrderItem: { salesOrder: { commerceId } } }] },
    { OR: [{ purchaseOrderId: null }, { purchaseOrderItem: { purchaseOrder: { commerceId } } }] },
  ],
} satisfies Prisma.StockMovementWhereInput);

const getStockMovementsFromDatabase = (commerceId: number) =>
  prisma.stockMovement.findMany({ where: movementWhere(commerceId), orderBy: { createdAt: "desc" } }).then((records) => records.map(movementResponse));

const getStockMovementByIdFromDatabase = (id: number, commerceId: number) =>
  prisma.stockMovement.findUnique({ where: { id, ...movementWhere(commerceId) } }).then((record) => record ? movementResponse(record) : null);

const getStockMovementsByProductIdFromDatabase = (productId: number, commerceId: number) =>
  prisma.stockMovement.findMany({ where: { ...movementWhere(commerceId), productId }, orderBy: { createdAt: "desc" } }).then((records) => records.map(movementResponse));

const getStockMovementsByProductSkuFromDatabase = (sku: string, commerceId: number) =>
  prisma.stockMovement.findMany({ where: { ...movementWhere(commerceId), product: { commerceId, sku } }, orderBy: { createdAt: "desc" } }).then((records) => records.map(movementResponse));

const postStockMovementToDatabase = (body: unknown, commerceId: number) => {
  // Las compras/ventas generan sus movimientos internamente; no se aceptan referencias externas.
  const source = readBody(body, ["type", "productId", "quantity", "previousStock", "newStock", "reason"]);
  if (source.type !== "MANUAL_ENTRY" && source.type !== "MANUAL_EXIT" && source.type !== "ADJUSTMENT") {
    throw new ApiError(400, "Solo se pueden registrar movimientos manuales desde esta ruta.");
  }
  const type = source.type;
  const productId = readId(source.productId);
  if (!isValidDecimal(source.quantity, 3, true) || !isValidDecimal(source.previousStock, 3) || !isValidDecimal(source.newStock, 3)) {
    throw new ApiError(400, "Las cantidades deben ser válidas, con hasta tres decimales y stock no negativo.");
  }
  const { quantity, previousStock, newStock } = source;
  const reason = source.reason === undefined || source.reason === null ? null : readText(source.reason, "reason", 1000, true);
  if (Math.round(newStock * 1000) - Math.round(previousStock * 1000) !== Math.round(quantity * 1000) || quantity === 0 ||
    (type === "MANUAL_ENTRY" && quantity < 0) || (type === "MANUAL_EXIT" && quantity > 0)) {
    throw new ApiError(400, "La cantidad y el tipo del movimiento no coinciden con el cambio de stock.");
  }
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id_product_p" FROM "products_p" WHERE "id_product_p" = ${productId} AND "id_commerce_p" = ${commerceId} FOR UPDATE`;
    const product = await tx.product.findUniqueOrThrow({ where: { id: productId, commerceId, isActive: true }, select: { measurementUnit: true } });
    if (!isValidProductQuantity(quantity, product.measurementUnit, true) ||
      !isValidProductQuantity(previousStock, product.measurementUnit) || !isValidProductQuantity(newStock, product.measurementUnit)) {
      throw new ApiError(400, "Unidades y cajas solo admiten cantidades enteras.");
    }
    const changed = await tx.product.updateMany({
      where: { id: productId, commerceId, isActive: true, stock: previousStock },
      data: { stock: newStock },
    });
    if (changed.count !== 1) throw new ApiError(409, "El stock cambió desde que abriste la pantalla. Actualizá el producto antes de ajustar.");
    return movementResponse(await tx.stockMovement.create({ data: { commerceId, type, productId, measurementUnit: product.measurementUnit, quantity, previousStock, newStock, reason } }));
  });
};

export {
  getStockMovementsFromDatabase, getStockMovementByIdFromDatabase,
  getStockMovementsByProductIdFromDatabase, getStockMovementsByProductSkuFromDatabase,
  postStockMovementToDatabase,
};
