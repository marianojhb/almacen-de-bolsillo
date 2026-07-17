import { useState, ReactNode } from "react";
import { ProductsContext } from "@/contexts/ProductsContext";
import type { Product, NewProduct } from "@/types/Product";

type ProductsProviderProps = {
  children: ReactNode;
};

export const initialProducts: Product[] = [
  {
    id: 1,
    sku: "BEB-001",
    name: "Coca-Cola 500 ml",
    category: "Bebidas",
    price: 1800,
    stock: 12,
    minimumStock: 5,
  },
  {
    id: 2,
    sku: "LAC-001",
    name: "Leche entera",
    category: "Lácteos",
    price: 1500,
    stock: 3,
    minimumStock: 5,
  },
  {
    id: 3,
    sku: "ALM-001",
    name: "Azúcar 1 kg",
    category: "Almacén",
    price: 1300,
    stock: 8,
    minimumStock: 4,
  },
];

export function ProductsProvider({ children }: ProductsProviderProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  function addProduct(product: NewProduct): boolean {
    const normalizedSku = product.sku.trim().toUpperCase();
    const skuAlreadyExists = products.some((currentProduct) => currentProduct.sku.toUpperCase() === normalizedSku);

    if (skuAlreadyExists) {
      return false;
    }

    const newProduct: Product = {
      id: Date.now(),
      ...product,
      sku: normalizedSku,
    };

    setProducts((currentProducts) => [...currentProducts, newProduct]);

    return true;
  }

  function updateProduct(updatedProduct: Product): boolean {
    const normalizedSku = updatedProduct.sku.trim().toUpperCase();
    const skuAlreadyExists = products.some(
      (product) => product.id !== updatedProduct.id && product.sku.toUpperCase() === normalizedSku,
    );

    if (skuAlreadyExists) {
      return false;
    }

    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === updatedProduct.id
          ? { ...currentProduct, ...updatedProduct, sku: normalizedSku }
          : currentProduct,
      ),
    );

    return true;
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
      }}>
      {children}
    </ProductsContext.Provider>
  );
}
