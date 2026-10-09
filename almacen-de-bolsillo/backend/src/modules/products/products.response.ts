import type { Product, ProductOnSupplier } from "../../../generated/prisma/index.js";

export function productValuesResponse(product: Product) {
  return { ...product, price: Number(product.price), stock: Number(product.stock), stockMin: Number(product.stockMin), discount: Number(product.discount) };
}

export function supplierConditionsResponse(relation: ProductOnSupplier) {
  return { ...relation, price: relation.price === null ? null : Number(relation.price),
    pricePerPaq: Number(relation.pricePerPaq), minimumQuantity: relation.minimumQuantity === null ? null : Number(relation.minimumQuantity) };
}
