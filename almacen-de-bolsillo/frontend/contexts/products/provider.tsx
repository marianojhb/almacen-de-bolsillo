import { usePermissions } from "@/hooks/use-permissions";
import { useRef, useState, useEffect, ReactNode, useCallback } from "react";

import { ProductsContext } from "@/contexts/products/context";
import type {
  ProductWithRelations,
  CreateProductDto,
  Category,
  CreateCategoryDto,
  UpdateProductDto,
  SupplierOption,
} from "@almacen/shared";
import { createProductRequest, getProductsRequest, updateProductRequest } from "@/services/productsApi";
import { createCategoryRequest, getCategoriesRequest } from "@/services/categoriesApi";
import { getSupplierOptions } from "@/services/suppliersApi";

type ProductsProviderProps = {
  children: ReactNode;
};

export function ProductsProvider({ children }: ProductsProviderProps) {
  const { can } = usePermissions();
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  const refreshProductsRequest = useRef<Promise<void> | null>(null);
  const refreshProducts = useCallback(async () => {
    if (refreshProductsRequest.current) return refreshProductsRequest.current;
    const request = (async () => {
      if (!can("products.read")) { setProducts([]); setProductsError(null); setIsLoadingProducts(false); return; }
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
    })();
    refreshProductsRequest.current = request;
    try { await request; } finally { if (refreshProductsRequest.current === request) refreshProductsRequest.current = null; }
  }, [can]);

  const refreshCategoriesRequest = useRef<Promise<void> | null>(null);
  const refreshCategories = useCallback(async () => {
    if (refreshCategoriesRequest.current) return refreshCategoriesRequest.current;
    const request = (async () => {
      if (!can("categories.read")) { setCategories([]); setCategoriesError(null); setIsLoadingCategories(false); return; }
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
    })();
    refreshCategoriesRequest.current = request;
    try { await request; } finally { if (refreshCategoriesRequest.current === request) refreshCategoriesRequest.current = null; }
  }, [can]);

  const refreshSuppliersRequest = useRef<Promise<void> | null>(null);
  const refreshSuppliers = useCallback(async () => {
    if (refreshSuppliersRequest.current) return refreshSuppliersRequest.current;
    const request = (async () => {
      if (!can("products.create") && !can("products.update") && !can("purchases.create")) { setSuppliers([]); setSuppliersError(null); setIsLoadingSuppliers(false); return; }
      try {
        setIsLoadingSuppliers(true);
        setSuppliersError(null);
        const suppliers = await getSupplierOptions();
        setSuppliers(suppliers);
      } catch (error) {
        console.error("Error cargando proveedores:", error);
        setSuppliersError("Error cargando proveedores");
      } finally {
        setIsLoadingSuppliers(false);
      }
    })();
    refreshSuppliersRequest.current = request;
    try { await request; } finally { if (refreshSuppliersRequest.current === request) refreshSuppliersRequest.current = null; }
  }, [can]);

  useEffect(() => {
    refreshProducts();
    refreshCategories();
    refreshSuppliers();
  }, [refreshProducts, refreshCategories, refreshSuppliers]);

  async function addProduct(product: CreateProductDto): Promise<boolean> {
    if (!can("products.create")) return false;
    const normalizedSku = product.sku?.trim().toUpperCase() || null;
    const skuAlreadyExists = !!normalizedSku && products.some((currentProduct) => currentProduct.sku?.toUpperCase() === normalizedSku);

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
      await refreshSuppliers(); 

      return true;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async function updateProduct(updatedProduct: UpdateProductDto, id: number): Promise<boolean> {
    if (!can("products.update")) return false;
    const normalizedSku = updatedProduct.sku === undefined ? undefined : updatedProduct.sku?.trim().toUpperCase() || null;

    const skuAlreadyExists = products.some(
      (product) => normalizedSku && product.id !== id && product.sku?.toUpperCase() === normalizedSku,
    );

    if (skuAlreadyExists) {
      return false;
    }

    const productToUpdate: UpdateProductDto = {
      ...updatedProduct,
      ...(normalizedSku !== undefined ? { sku: normalizedSku } : {}),
    };

    try {
      await updateProductRequest(id, productToUpdate);
      await refreshProducts();

      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
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
    if (!can("categories.create")) throw new Error("No tenés permiso para crear categorías.");
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
        refreshCategories,
        refreshSuppliers,
        clearProducts: () => setProducts([]),
        clearCategories: () => setCategories([]),
        clearSuppliers: () => setSuppliers([]),
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
      }}>
      {children}
    </ProductsContext.Provider>
  );
}
