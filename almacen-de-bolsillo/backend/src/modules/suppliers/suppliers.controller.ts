import type { Request, Response } from "express";

import { deleteSupplierFromDatabase, getSupplierByIdFromDatabase, getSuppliersFromDatabase, postSupplierToDatabase, updateSupplierFromDatabase } from "./suppliers.service.js";

  // Manejo de errores de la base de datos
  const sendDatabaseError = (res: Response, error: unknown, action: string,) => {
  const code = typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : null;

  if (code === "P2002") {
    res.status(409).json({
      message:
        "Ya existe un proveedor con ese CUIT.",
    });
    return;
  }

  if (code === "P2025") {
    res.status(404).json({
      message: "Proveedor no encontrado.",
    });
    return;
  }

  if (code === "P2003") {
    res.status(409).json({
      message:
        "No se puede eliminar el proveedor porque tiene registros relacionados.",
    });
    return;
  }

  console.error(
    `Error ${action} supplier:`,
    error,
  );

  res.status(500).json({
    message: "Error interno del servidor.",
  });
};

const getSuppliers = async (_req: Request, res: Response) => {
  try {
    const suppliers =
      await getSuppliersFromDatabase();

    res.json(suppliers);
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "fetching",
    );
  }
};

const getSupplierById = async (req: Request, res: Response) => {
  const supplierId = Number(req.params.id);

  // Validación del ID del proveedor
  if (!Number.isInteger(supplierId) || supplierId <= 0) {
    res.status(400).json({
      message:
        "El ID del proveedor no es válido.",
    });
    return;
  }
  
  try {
    const supplier =
      await getSupplierByIdFromDatabase(
        supplierId,
      );

    if (!supplier) {
      res.status(404).json({
        message: "Proveedor no encontrado.",
      });
      return;
    }

    res.json(supplier);
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "fetching",
    );
  }
};

const postSupplier = async (req: Request, res: Response) => {
  try {
    const supplier =
      await postSupplierToDatabase(req.body);

    res.status(201).json(supplier);
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "creating",
    );
  }
};

const updateSupplier = async (req: Request, res: Response) => {
  const supplierId = Number(req.params.id);
  
  // Validación del ID del proveedor
  if (!Number.isInteger(supplierId) || supplierId <= 0) {
    res.status(400).json({
      message:
        "El ID del proveedor no es válido.",
    });
    return;
  }

  try {
    const supplier =
      await updateSupplierFromDatabase(
        supplierId,
        req.body,
      );

    res.json(supplier);
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "updating",
    );
  }
};

const deleteSupplier = async (req: Request, res: Response) => {
  const supplierId = Number(req.params.id);
  
  // Validación del ID del proveedor
  if (!Number.isInteger(supplierId) || supplierId <= 0) {
    res.status(400).json({
      message:
        "El ID del proveedor no es válido.",
    });
    return;
  }

  try {
    await deleteSupplierFromDatabase(
      supplierId,
    );

    res.status(204).send();
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "deleting",
    );
  }
};

export {
  getSuppliers,
  getSupplierById,
  postSupplier,
  updateSupplier,
  deleteSupplier,
};