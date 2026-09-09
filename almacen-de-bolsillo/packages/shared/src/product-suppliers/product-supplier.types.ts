export type ProductOnSupplierDetailsDto = {
  price?: number | null;
  supplierCategory?: string | null;
  unitsPerPaq?: number | null;
  pricePerPaq: number;
  minimumQuantity?: number | null;
  salesTerms?: string | null;
  leadTimeDays?: number | null;
};

export type CreateProductOnSupplierDto = ProductOnSupplierDetailsDto & {
  productId: number;
  supplierId: number;
};

export type CreateProductOnSupplierFromProductDto = ProductOnSupplierDetailsDto & {
  supplierId: number;
};

export type CreateProductOnSupplierFromSupplierDto = ProductOnSupplierDetailsDto & {
  productId: number;
};
