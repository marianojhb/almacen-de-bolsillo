export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minimumStock: number;
};

export const products: Product[] = [
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
