export type Product = {
  id: number;
  sku: string;
  shortname: string;
  longname: string;
  price: number;
  stock: number;
  stockMin: number;
  categoryId: number;
  isActive: boolean;
};

export type NewProduct = Omit<Product, "id">;
