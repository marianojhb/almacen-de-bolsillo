import { useState, useEffect, ReactNode, useCallback } from "react";

import { ProductsContext } from "@/contexts/products/context";
import type {
  ProductWithRelations,
  CreateProductDto,
  Category,
  CreateCategoryDto,
  UpdateProductDto,
} from "@almacen/shared";
import { createProductRequest, getProducts, updateProductRequest } from "@/services/productsApi";
import { createCategoryRequest, getCategories } from "@/services/categoriesApi";

type ProductsProviderProps = {
  children: ReactNode;
};

export function ProductsProvider({ children }: ProductsProviderProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // State to track loading and error states
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      setProductsError(null);
      const products = await getProducts(true);
      setProducts(products);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setProductsError("Error cargando productos");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      const categories = await getCategories();
      setCategories(categories);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setCategoriesError("Error cargando categorías");
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    // Obtener los productos desde la API y actualizar el estado
    refreshProducts();
    // Obtener las categorías desde la API y actualizar el estado
    fetchCategories();
  }, [refreshProducts, fetchCategories]);

  async function addProduct(product: CreateProductDto): Promise<boolean> {
    const normalizedSku = product.sku.trim().toUpperCase();
    const skuAlreadyExists = products.some((currentProduct) => currentProduct.sku.toUpperCase() === normalizedSku);

    if (skuAlreadyExists) {
      return false;
    }

    const productToCreate: CreateProductDto = {
      ...product,
      sku: normalizedSku,
    };

    try {
      await createProductRequest(productToCreate);
      await refreshProducts();
      // const savedProduct = await createProductRequest(productToCreate);
      // setProducts((currentProducts) => [...currentProducts, savedProduct]);

      return true;
    } catch (error) {
      console.error("Error creating product:", error);
      return false;
    }
  }

  async function updateProduct(updatedProduct: UpdateProductDto, id: number): Promise<boolean> {
    const normalizedSku = updatedProduct.sku?.trim().toUpperCase();
    const skuAlreadyExists = products.some(
      (product) => normalizedSku && product.id !== id && product.sku.toUpperCase() === normalizedSku,
    );

    if (skuAlreadyExists) {
      return false;
    }

    const productToUpdate: UpdateProductDto = {
      ...updatedProduct,
      ...(normalizedSku ? { sku: normalizedSku } : {}),
    };

    try {
      const productPayload = {
        sku: productToUpdate.sku,
        shortname: productToUpdate.shortname,
        longname: productToUpdate.longname,
        price: productToUpdate.price,
        stock: productToUpdate.stock,
        stockMin: productToUpdate.stockMin,
        categoryId: productToUpdate.categoryId,
        isActive: productToUpdate.isActive,
      };
      await updateProductRequest(id, productPayload);
      await refreshProducts();

      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      return false;
    }
  }

  async function deleteProduct(id: number): Promise<boolean> {
    const productExists = products.some((product) => product.id === id);

    if (!productExists) {
      return false;
    }

    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === id ? { ...currentProduct, isActive: false } : currentProduct,
      ),
    );
    return true;
  }

  async function addCategory(category: CreateCategoryDto): Promise<Category> {
    const createdCategory = await createCategoryRequest(category);
    setCategories((currentCategories) => [...currentCategories, createdCategory]);
    return createdCategory;
  }

  return (
    <ProductsContext.Provider
      value={{
        isLoadingProducts,
        isLoadingCategories,
        productsError,
        categoriesError,
        products,
        categories,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
      }}>
      {children}
    </ProductsContext.Provider>
  );
}
