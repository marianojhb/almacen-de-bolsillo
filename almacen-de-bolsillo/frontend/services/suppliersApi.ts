import type { CreateSupplierDto, UpdateSupplierDto, Supplier } from "@almacen/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getSuppliers(includeInactive?: boolean): Promise<Supplier[]> {
  const response = await fetch(`${API_URL}/suppliers?includeInactive=${includeInactive}`);

  if (!response.ok) {
    throw new Error("Error fetching suppliers");
  }

  return response.json();
}

export async function createSupplierRequest(supplier: CreateSupplierDto): Promise<Supplier> {
  const response = await fetch(`${API_URL}/suppliers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(supplier),
  });

  if (!response.ok) {
    throw new Error("Error creating supplier");
  }

  return response.json();
}

export async function updateSupplierRequest(supplierId: number, supplier: UpdateSupplierDto): Promise<Supplier> {
  const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(supplier),
  });

  if (!response.ok) {
    throw new Error("Error updating supplier");
  }

  return response.json();
}

export async function deleteSupplierRequest(supplierId: number): Promise<void> {
  const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error deleting supplier");
  }
}
