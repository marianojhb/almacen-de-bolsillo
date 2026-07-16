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

  function addProduct(product: NewProduct): void {
    const newProduct: Product = {
      id: Date.now(),
      ...product,
    };

    setProducts((currentProducts) => [...currentProducts, newProduct]);
  }

  function updateProduct(updatedProduct: Product): void {
    setProducts((currentProducts) =>
      currentProducts.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)),
    );
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
