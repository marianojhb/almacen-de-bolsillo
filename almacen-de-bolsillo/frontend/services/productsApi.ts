import type { NewProduct, Product, ProductWithCategory } from "@/types/Product";

const API_URL = "http://192.168.0.45:3000";

export async function getProducts(includeInactive?: boolean): Promise<ProductWithCategory[]> {
  const response = await fetch(`${API_URL}/products?includeInactive=${includeInactive}`);

  if (!response.ok) {
    throw new Error("Error fetching products");
  }

  return response.json();
}

export async function createProductRequest(product: NewProduct): Promise<ProductWithCategory> {
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

export async function updateProductRequest(productId: number, product: Product): Promise<ProductWithCategory> {
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

export async function deleteProductRequest(productId: number): Promise<void> {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error deleting product");
  }
}
