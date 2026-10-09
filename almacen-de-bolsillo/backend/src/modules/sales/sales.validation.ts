import { sumAmounts } from "@almacen/shared";
import { ApiError, readBody, readText, readPayment } from "../auth/request.utils.js";
import { readAmount, readOrderItems } from "../products/order.validation.js";

export function validateSale(body: unknown) {
  const source = readBody(body, ["invoice", "sellerId", "paymentMethod", "walletProvider", "discount", "ivaSales", "taxableBase", "total", "subtotal", "salesOrderItems"]);
  const items = readOrderItems(source.salesOrderItems, true);
  const subtotal = sumAmounts(items.map((item) => item.subtotal));
  const discount = readAmount(source.discount ?? 0, "discount", true);
  if (discount > subtotal) throw new ApiError(400, "El descuento supera el subtotal.");
  const total = sumAmounts([subtotal, -discount]);
  const taxableBase = readAmount(source.taxableBase, "taxableBase");
  const ivaSales = readAmount(source.ivaSales, "ivaSales");
  if (Math.round((taxableBase + ivaSales) * 100) !== Math.round(total * 100)) throw new ApiError(400, "La base imponible y el IVA no coinciden con el total.");
  return {
    invoice: source.invoice === undefined ? "" : readText(source.invoice, "invoice", 255, true),
    ...readPayment(source.paymentMethod, source.walletProvider),
    subtotal, discount, total, taxableBase, ivaSales, items,
  };
}
