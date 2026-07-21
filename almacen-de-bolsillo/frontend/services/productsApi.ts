import type { Product } from "@/types/Product";

const API_URL = "http://192.168.0.45:3000";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Error fetching products");
  }

  return response.json();
}

export async function updateProductRequest(productId: number, product: Product): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "PUT",
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
