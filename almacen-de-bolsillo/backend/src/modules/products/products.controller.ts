import { readId, sendApiError } from "../auth/request.utils.js";
import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { validateCreateProduct, validateUpdateProduct } from "./products.validation.js";
import {
  getProductsFromDatabase,
  getProductByIdFromDatabase,
  postProductToDatabase,
  updateProductFromDatabase,
  deleteProductFromDatabase,
} from "./products.service.js";

const databaseMessages = {
  "notFound": "Producto no encontrado.",
  "duplicate": "El SKU ya está registrado en este comercio.",
  "related": "La categoría o un proveedor ya no está disponible. Revisá los datos."
};

const getProducts = async (req: Request, res: Response) => {
  try {
    const commerceId = getRequestSession(res).commerce.id;
    const includeInactive = req.query.includeInactive === "true";
    const products = await getProductsFromDatabase(commerceId, { includeInactive });
    res.json(products);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const commerceId = getRequestSession(res).commerce.id;
    const productId = readId(req.params.id);
    const product = await getProductByIdFromDatabase(productId, commerceId);
    if (!product) {
      res.status(404).json({ message: "Producto no encontrado." });
      return;
    }
    res.json(product);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const postProduct = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const data = validateCreateProduct(req.body);
    if (!data.isActive && !session.permissions.includes("products.delete")) {
      res.status(403).json({ message: "No tenés permiso para crear un producto dado de baja." });
      return;
    }
    const product = await postProductToDatabase(data, session.commerce.id);
    res.status(201).json(product);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const updateProduct = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const productId = readId(req.params.id);
    const data = validateUpdateProduct(req.body);
    if (data.stock !== undefined) {
      res.status(400).json({ message: "Para modificar el stock, usá Ajustar stock. Así se conserva el historial." });
      return;
    }

    if (data.isActive === false && !session.permissions.includes("products.delete")) {
      res.status(403).json({ message: "No tenés permiso para dar de baja productos." });
      return;
    }
    const product = await updateProductFromDatabase(productId, data, session.commerce.id);
    if (!product) {
      res.status(404).json({ message: "Producto no encontrado." });
      return;
    }
    res.json(product);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const commerceId = getRequestSession(res).commerce.id;
    const productId = readId(req.params.id);
    await deleteProductFromDatabase(productId, commerceId);
    res.status(204).send();
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

export { getProducts, getProductById, postProduct, updateProduct, deleteProduct };
