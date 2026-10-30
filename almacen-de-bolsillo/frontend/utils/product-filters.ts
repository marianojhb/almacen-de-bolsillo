type FilterableProduct = {
  categoryId: number;
  shortname: string;
  stock: number;
  stockMin: number;
  isActive: boolean;
};

type ProductFilters = {
  categoryId: string | null;
  searchText: string;
  lowStockOnly: boolean;
  inactiveOnly: boolean;
};

export function matchesProductFilters(product: FilterableProduct, filters: ProductFilters): boolean {
  const search = filters.searchText.trim().toLowerCase();
  return (
    (!filters.categoryId || product.categoryId === Number(filters.categoryId)) &&
    (!search || product.shortname.toLowerCase().includes(search)) &&
    (!filters.lowStockOnly || product.stock <= product.stockMin) &&
    (filters.inactiveOnly ? !product.isActive : product.isActive)
  );
}
