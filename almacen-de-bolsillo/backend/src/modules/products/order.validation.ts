import { isValidDecimal, lineAmount, sumAmounts } from "@almacen/shared";
import { ApiError, readBody, readId } from "../auth/request.utils.js";

export function readAmount(value: unknown, name: string, discount = false): number {
  if (!isValidDecimal(value, 2) || (discount && value > 99999999.99)) {
    throw new ApiError(400, "El importe " + name + " no es válido o tiene más de dos decimales.");
  }
  return value;
}

export function readOrderItems(value: unknown, sale: boolean) {
  if (!Array.isArray(value) || !value.length || value.length > 500) throw new ApiError(400, "Indicá entre 1 y 500 productos.");
  const items = value.map((entry) => {
    const item = readBody(entry, ["productId", "quantity", "price", "discount", ...(sale ? ["shortname", "longname", "subtotal"] : [])]);
    const productId = readId(item.productId);
    if (!isValidDecimal(item.quantity, 3) || item.quantity <= 0) throw new ApiError(400, "La cantidad debe ser mayor que cero y tener hasta tres decimales.");
    const quantity = item.quantity;
    const price = readAmount(item.price, "price");
    const discount = readAmount(item.discount ?? 0, "discount", true);
    const subtotal = lineAmount(quantity, price, discount);
    if (subtotal < 0) throw new ApiError(400, "El descuento supera el importe del producto.");
    readAmount(subtotal, "subtotal");
    return { productId, quantity, price, discount, subtotal };
  });
  if (new Set(items.map((item) => item.productId)).size !== items.length) throw new ApiError(400, "No se puede repetir un producto.");
  readAmount(sumAmounts(items.map((item) => item.subtotal)), "total");
  return items;
}
