import type { CreateSupplierDto, UpdateSupplierDto, SupplierWithRelations, SupplierOption } from "@almacen/shared";

import { apiFetch } from "./apiClient";

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const error = await response.json();

    return error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getSupplierOptions(): Promise<SupplierOption[]> {
  const response = await apiFetch("/suppliers/options");
  if (!response.ok) throw new Error(await getErrorMessage(response, "No se pudieron cargar los proveedores disponibles."));
  return response.json();
}

export async function getSuppliers(): Promise<SupplierWithRelations[]> {
  const response = await apiFetch(
    `/suppliers`,
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

export async function createSupplierRequest(supplier: CreateSupplierDto): Promise<SupplierWithRelations> {
  const response = await apiFetch(
    `/suppliers`,
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

export async function updateSupplierRequest(supplierId: number, supplier: UpdateSupplierDto): Promise<SupplierWithRelations> {
  const response = await apiFetch(
    `/suppliers/${supplierId}`,
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

export async function deleteSupplierRequest(supplierId: number): Promise<void> {
  const response = await apiFetch(
    `/suppliers/${supplierId}`,
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
