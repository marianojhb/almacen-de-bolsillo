import type { Category } from "@/types/Product";

const API_URL = "http://192.168.0.45:3000";

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    throw new Error("Error fetching categories");
  }

  return response.json();
}

export async function createCategoryRequest(category: { name: string }): Promise<Category> {
  const response = await fetch(`${API_URL}/categories`, {
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
