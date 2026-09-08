import type { Request, Response } from "express";
import type { ProductSupplierRelationInput } from "@almacen/shared";

import {
  getProductsFromDatabase,
  getProductByIdFromDatabase,
  postProductToDatabase,
  updateProductFromDatabase,
  deleteProductFromDatabase,
} from "./products.service.js";

const isOptionalNonNegativeNumber = (value: unknown) =>
  value === undefined || value === null || (typeof value === "number" && Number.isFinite(value) && value >= 0);

const isValidSupplierRelation = (relation: unknown): relation is ProductSupplierRelationInput => {
  if (typeof relation !== "object" || relation === null) {
    return false;
  }

  const candidate = relation as Record<string, unknown>;

  return (
    Number.isInteger(candidate.supplierId) &&
    Number(candidate.supplierId) > 0 &&
    typeof candidate.pricePerPaq === "number" &&
    Number.isFinite(candidate.pricePerPaq) &&
    candidate.pricePerPaq >= 0 &&
    isOptionalNonNegativeNumber(candidate.price) &&
    isOptionalNonNegativeNumber(candidate.unitsPerPaq) &&
    isOptionalNonNegativeNumber(candidate.minimumQuantity) &&
    isOptionalNonNegativeNumber(candidate.leadTimeDays) &&
    (candidate.unitsPerPaq === undefined || candidate.unitsPerPaq === null || Number.isInteger(candidate.unitsPerPaq)) &&
    (candidate.leadTimeDays === undefined || candidate.leadTimeDays === null || Number.isInteger(candidate.leadTimeDays))
  );
};

const hasValidSupplierRelations = (value: unknown) =>
  value === undefined ||
  (Array.isArray(value) &&
    value.every(isValidSupplierRelation) &&
    new Set(value.map((relation) => relation.supplierId)).size === value.length);

const getProducts = async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === "true";
  try {
    const products = await getProductsFromDatabase({ includeInactive });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProductById = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  try {
    const product = await getProductByIdFromDatabase(productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const postProduct = async (req: Request, res: Response) => {
  const productData = req.body;

  if (!hasValidSupplierRelations(productData.supplierRelations)) {
    res.status(400).json({ message: "Los datos de los proveedores no son válidos." });
    return;
  }

  try {
    const newProduct = await postProductToDatabase(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  if (!hasValidSupplierRelations(req.body.supplierRelations)) {
    res.status(400).json({ message: "Los datos de los proveedores no son válidos." });
    return;
  }

  try {
    const updatedProduct = await updateProductFromDatabase(productId, req.body);
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  try {
    await deleteProductFromDatabase(productId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getProducts, getProductById, postProduct, updateProduct, deleteProduct };
