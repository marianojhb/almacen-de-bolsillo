import type { Category } from "@almacen/shared";

import { apiFetch } from "./apiClient";

export async function getCategoriesRequest(): Promise<Category[]> {
  const response = await apiFetch(`/categories`);

  if (!response.ok) {
    throw new Error("Error fetching categories");
  }

  return response.json();
}

export async function createCategoryRequest(category: { name: string }): Promise<Category> {
  const response = await apiFetch(`/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    throw new Error("Error creating category");
  }

  return response.json();
}
