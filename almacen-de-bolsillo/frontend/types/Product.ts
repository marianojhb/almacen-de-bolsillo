export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minimumStock: number;
  isActive: boolean;
};

export type NewProduct = Omit<Product, "id">;
