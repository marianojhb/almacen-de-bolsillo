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

export type ProductWithCategory = Product & {
  category: {
    id: number;
    name: string;
  };
};

export type Category = {
  id: number;
  name: string;
};
