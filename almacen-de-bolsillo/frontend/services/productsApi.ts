import type { Product, CreateProductDto, UpdateProductDto, ProductWithRelations } from "@almacen/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function getErrorMessageRequest(response: Response, fallback: string) {
  try {
    const error = await response.json();
    return error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getProductsRequest(includeInactive?: boolean): Promise<ProductWithRelations[]> {
  const response = await fetch(`${API_URL}/products?includeInactive=${includeInactive}`);

  if (!response.ok) {
    throw new Error(await getErrorMessageRequest(response, "Error getting products"));
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
    throw new Error(await getErrorMessageRequest(response, "Error creating product"));
  }

  return response.json();
}

export async function updateProductRequest(
  productId: number,
  product: UpdateProductDto,
): Promise<ProductWithRelations> {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessageRequest(response, "Error updating product"));
  }

  return response.json();
}

export async function deleteProductRequest(productId: number): Promise<void> {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessageRequest(response, "Error deleting product"));
  }
}
