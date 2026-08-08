import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductWithCategory,
  ProductWithRelations,
} from "@almacen/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getProducts(includeInactive?: boolean): Promise<ProductWithRelations[]> {
  const response = await fetch(`${API_URL}/products?includeInactive=${includeInactive}`);

  if (!response.ok) {
    throw new Error("Error fetching products");
  }

  return response.json();
}

export async function createProductRequest(product: CreateProductDto): Promise<Product> {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error("Error creating product");
  }

  return response.json();
}

export async function updateProductRequest(
  productId: number,
  product: UpdateProductDto,
): Promise<ProductWithRelations> {
  console.log(product);
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error("Error updating product");
  }

  return response.json();
}

export async function deleteProductRequest(productId: number): Promise<void> {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error deleting product");
  }
}
