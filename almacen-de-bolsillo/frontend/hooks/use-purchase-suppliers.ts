import { useMemo } from "react";
import { useProducts } from "@/contexts/products";

export function usePurchaseSuppliers() {
  const { products, suppliers: options, isLoadingProducts, isLoadingSuppliers, productsError, suppliersError } = useProducts();
  const suppliers = useMemo(() => options.map((supplier) => ({
    ...supplier,
    products: products.flatMap((product) => product.suppliers
      .filter((relation) => relation.supplierId === supplier.id)
      .map((relation) => ({ ...relation, productId: product.id }))),
  })), [products, options]);
  return { suppliers, isLoadingSuppliers: isLoadingProducts || isLoadingSuppliers, suppliersError: productsError || suppliersError };
}
