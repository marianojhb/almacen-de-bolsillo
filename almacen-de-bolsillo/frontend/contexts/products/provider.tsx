import { useState, useEffect, ReactNode, useCallback } from "react";

import { ProductsContext } from "@/contexts/products/context";
import type {
  ProductWithRelations,
  CreateProductDto,
  Category,
  CreateCategoryDto,
  UpdateProductDto,
  Supplier,
} from "@almacen/shared";
import { createProductRequest, getProductsRequest, updateProductRequest } from "@/services/productsApi";
import { createCategoryRequest, getCategoriesRequest } from "@/services/categoriesApi";
import { getSuppliers } from "@/services/suppliersApi";

type ProductsProviderProps = {
  children: ReactNode;
};

export function ProductsProvider({ children }: ProductsProviderProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // State to track loading and error states
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      setProductsError(null);
      const products = await getProductsRequest(true);
      setProducts(products);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setProductsError("Error cargando productos");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      const categories = await getCategoriesRequest();
      setCategories(categories);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setCategoriesError("Error cargando categorías");
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const refreshSuppliers = useCallback(async () => {
    try {
      setIsLoadingSuppliers(true);
      setSuppliersError(null);
      const suppliers = await getSuppliers();
      setSuppliers(suppliers);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      setSuppliersError("Error cargando proveedores");
    } finally {
      setIsLoadingSuppliers(false);
    }
  }, []);

  useEffect(() => {
    // Obtener los productos desde la API y actualizar el estado
    refreshProducts();
    // Obtener las categorías desde la API y actualizar el estado
    refreshCategories();
    // Obtener los proveedores desde la API y actualizar el estado
    refreshSuppliers();
  }, [refreshProducts, refreshCategories, refreshSuppliers]);

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
      await refreshSuppliers(); // Refresh suppliers after creating a product to ensure the latest data is available

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
      await updateProductRequest(id, productToUpdate);
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
        isLoadingSuppliers,
        productsError,
        categoriesError,
        suppliersError,
        products,
        categories,
        suppliers,
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
