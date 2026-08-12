import type { CreateSupplierDto, Supplier, UpdateSupplierDto } from "@almacen/shared";

// Supplier with products

import type { SupplierWithItems, UpdateSupplierProductsDto } from "@almacen/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const error = await response.json();

    return error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await fetch(
    `${API_URL}/suppliers`,
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron obtener los proveedores.",
      ),
    );
  }

  return response.json();
}

export async function createSupplierRequest(supplier: CreateSupplierDto,): Promise<Supplier> {
  const response = await fetch(
    `${API_URL}/suppliers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplier),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo crear el proveedor.",
      ),
    );
  }

  return response.json();
}

export async function updateSupplierRequest(supplierId: number, supplier: UpdateSupplierDto): Promise<Supplier> {
  const response = await fetch(
    `${API_URL}/suppliers/${supplierId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplier),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo actualizar el proveedor.",
      ),
    );
  }

  return response.json();
}

export async function deleteSupplierRequest(supplierId: number,): Promise<void> {
  const response = await fetch(
    `${API_URL}/suppliers/${supplierId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo eliminar el proveedor.",
      ),
    );
  }
}

// Supplier with products

export async function getSupplierProducts(supplierId: number): Promise<SupplierWithItems> {
  const response = await fetch(
    `${API_URL}/suppliers/${supplierId}/products`,
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron obtener los productos del proveedor.",
      ),
    );
  }

  return response.json();
}

export async function updateSupplierProductsRequest(supplierId: number, data: UpdateSupplierProductsDto): Promise<SupplierWithItems> {
  const response = await fetch(
    `${API_URL}/suppliers/${supplierId}/products`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron actualizar los productos del proveedor.",
      ),
    );
  }

  return response.json();
}