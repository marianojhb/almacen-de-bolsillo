import { sumAmounts } from "@almacen/shared";
import { readBody, readId, readPayment } from "../auth/request.utils.js";
import { readOrderItems } from "../products/order.validation.js";

export function validatePurchase(body: unknown) {
  const source = readBody(body, ["supplierId", "userId", "paymentMethod", "walletProvider", "total", "items"]);
  const items = readOrderItems(source.items, false);
  return { supplierId: readId(source.supplierId), items, total: sumAmounts(items.map((item) => item.subtotal)), ...readPayment(source.paymentMethod, source.walletProvider) };
}
