import { readId, sendApiError } from "../auth/request.utils.js";
import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { validateCreateSupplier, validateUpdateSupplier } from "./suppliers.validation.js";
import {
  getSupplierOptionsFromDatabase,
  deleteSupplierFromDatabase,
  getSupplierByIdFromDatabase,
  getSuppliersFromDatabase,
  postSupplierToDatabase,
  updateSupplierFromDatabase,
} from "./suppliers.service.js";

const getRelatedReadOptions = (permissions: string[]) => ({
  includeProducts: permissions.includes("products.read"),
  includePurchases: permissions.includes("purchases.read"),
});

const databaseMessages = {
  "notFound": "Proveedor no encontrado.",
  "duplicate": "El CUIT ya está registrado en este comercio.",
  "related": "Un registro relacionado ya no está disponible. Revisá los datos."
};

const getSuppliers = async (_req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const suppliers = await getSuppliersFromDatabase(session.commerce.id, getRelatedReadOptions(session.permissions));
    res.json(suppliers);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const getSupplierById = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const supplierId = readId(req.params.id);
    const supplier = await getSupplierByIdFromDatabase(supplierId, session.commerce.id, getRelatedReadOptions(session.permissions));
    if (!supplier) {
      res.status(404).json({ message: "Proveedor no encontrado." });
      return;
    }
    res.json(supplier);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const postSupplier = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const data = validateCreateSupplier(req.body);
    const supplier = await postSupplierToDatabase(data, session.commerce.id, getRelatedReadOptions(session.permissions));
    res.status(201).json(supplier);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const updateSupplier = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const supplierId = readId(req.params.id);
    const data = validateUpdateSupplier(req.body);
    if (data.isActive === false && !session.permissions.includes("suppliers.delete")) {
      res.status(403).json({ message: "No tenés permiso para dar de baja proveedores." });
      return;
    }
    const supplier = await updateSupplierFromDatabase(supplierId, data, session.commerce.id, getRelatedReadOptions(session.permissions));
    if (!supplier) {
      res.status(404).json({ message: "Proveedor no encontrado." });
      return;
    }
    res.json(supplier);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const commerceId = getRequestSession(res).commerce.id;
    const supplierId = readId(req.params.id);
    await deleteSupplierFromDatabase(supplierId, commerceId);
    res.status(204).send();
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const getSupplierOptions = async (_req: Request, res: Response) => {
  try {
    res.json(await getSupplierOptionsFromDatabase(getRequestSession(res).commerce.id));
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

export { getSupplierOptions, getSuppliers, getSupplierById, postSupplier, updateSupplier, deleteSupplier };
