import { useState, useEffect, ReactNode } from "react";
import { ProductsContext } from "@/contexts/products/context";
import type { Product, NewProduct } from "@/types/Product";
import { getProducts, updateProductRequest } from "@/services/productsApi";

type ProductsProviderProps = {
  children: ReactNode;
};

export function ProductsProvider({ children }: ProductsProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);

  // State to track loading and error states
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    // Obtener los productos desde la API y actualizar el estado
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        setProductsError(null);
        const products = await getProducts(true);
        setProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductsError("Error fetching products");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();

    // Actualizar el estado y el fetch con los productos obtenidos desde la API
  }, []);

  async function addProduct(product: NewProduct): Promise<boolean> {
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

  async function updateProduct(updatedProduct: Product): Promise<boolean> {
    const normalizedSku = updatedProduct.sku.trim().toUpperCase();
    const skuAlreadyExists = products.some(
      (product) => product.id !== updatedProduct.id && product.sku.toUpperCase() === normalizedSku,
    );

    if (skuAlreadyExists) {
      return false;
    }

    const productToUpdate: Product = {
      ...updatedProduct,
      sku: normalizedSku,
    };

    try {
      const savedProduct = await updateProductRequest(productToUpdate.id, productToUpdate);

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct.id === savedProduct.id ? savedProduct : currentProduct,
        ),
      );

      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      return false;
    }
  }

  async function deleteProduct(updatedProduct: Product): Promise<boolean> {
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
        isLoadingProducts,
        productsError,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
      }}>
      {children}
    </ProductsContext.Provider>
  );
}
