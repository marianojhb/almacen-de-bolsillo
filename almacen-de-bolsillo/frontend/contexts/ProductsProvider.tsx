import { useState, useEffect, ReactNode } from "react";
import { ProductsContext } from "@/contexts/ProductsContext";
import type { Product, NewProduct } from "@/types/Product";
import { getProducts } from "@/services/productsApi";

type ProductsProviderProps = {
  children: ReactNode;
};

export const initialProducts: Product[] = [
  {
    id: 1,
    sku: "BEB-001",
    shortname: "Coca-Cola 500 ml",
    longname: "Coca-Cola 500 ml botella de plástico",
    categoryId: 1,
    price: 1800,
    stock: 12,
    stockMin: 5,
    isActive: true,
  },
  {
    id: 2,
    sku: "LAC-001",
    shortname: "Leche entera",
    longname: "Leche entera 1 litro",
    categoryId: 1,
    price: 1500,
    stock: 3,
    stockMin: 5,
    isActive: false,
  },
  {
    id: 3,
    sku: "ALM-001",
    shortname: "Azúcar 1 kg",
    longname: "Azúcar blanca 1 kg bolsa",
    categoryId: 2,
    price: 1300,
    stock: 8,
    stockMin: 4,
    isActive: true,
  },
];

export function ProductsProvider({ children }: ProductsProviderProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const activeProducts = products.filter((product) => product.isActive === true);

  useEffect(() => {
    // Fetch products from the API when the component mounts
    const fetchProducts = async () => {
      try {
        const products = await getProducts();
        // Update the context or state with the fetched products
        // Assuming you have a method to set products in your context
        setProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();

    // Update the context or state with the fetched products
  }, []);

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

  function deleteProduct(updatedProduct: Product): boolean {
    const productExists = products.some((product) => product.id === updatedProduct.id);

    if (!productExists) {
      return false;
    }

    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === updatedProduct.id
          ? { ...currentProduct, ...updatedProduct, isActive: false }
          : currentProduct,
      ),
    );
    return true;
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        activeProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}>
      {children}
    </ProductsContext.Provider>
  );
}
