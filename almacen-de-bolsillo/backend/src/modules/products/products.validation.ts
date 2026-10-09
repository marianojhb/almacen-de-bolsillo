import { ApiError } from "../auth/request.utils.js";
import { isMeasurementUnit, isValidDecimal, isValidProductQuantity } from "@almacen/shared";
import type { CreateProductDto, CreateProductOnSupplierFromProductDto, UpdateProductDto } from "@almacen/shared";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const isPositiveId = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 2147483647;

const validateSupplierRelations = (value: unknown): CreateProductOnSupplierFromProductDto[] => {
  if (!Array.isArray(value)) throw new ApiError(400, "Los proveedores deben indicarse en una lista.");
  const relations: CreateProductOnSupplierFromProductDto[] = [];
  const supplierIds = new Set<number>();
  const allowedFields = ["supplierId", "pricePerPaq", "price", "unitsPerPaq", "minimumQuantity", "leadTimeDays", "supplierCategory", "salesTerms"];

  for (const item of value) {
    if (!isRecord(item) || Object.keys(item).some((key) => !allowedFields.includes(key))) {
      throw new ApiError(400, "Los datos de los proveedores no son válidos.");
    }
    if (!isPositiveId(item.supplierId) || supplierIds.has(item.supplierId) || !isValidDecimal(item.pricePerPaq, 2)) {
      throw new ApiError(400, "Revisá los IDs, precios y proveedores repetidos.");
    }
    const relation: CreateProductOnSupplierFromProductDto = { supplierId: item.supplierId, pricePerPaq: item.pricePerPaq };
    for (const key of ["price", "unitsPerPaq", "minimumQuantity", "leadTimeDays"] as const) {
      const field = item[key];
      if (field === undefined) continue;
      if (field !== null && (!isNonNegativeNumber(field) ||
        ((key === "unitsPerPaq" || key === "leadTimeDays") && (!Number.isInteger(field) || field > 2147483647)) ||
        (key === "unitsPerPaq" && field < 1) ||
        (key === "price" && !isValidDecimal(field, 2)) || (key === "minimumQuantity" && !isValidDecimal(field, 3)))) {
        throw new ApiError(400, "Las cantidades, los precios y los plazos del proveedor no son válidos.");
      }
      relation[key] = field;
    }
    for (const key of ["supplierCategory", "salesTerms"] as const) {
      const field = item[key];
      if (field === undefined) continue;
      if (field !== null && (typeof field !== "string" || field.length > 1000)) {
        throw new ApiError(400, "La categoría y las condiciones del proveedor no son válidas.");
      }
      relation[key] = typeof field === "string" ? field.trim() : null;
    }
    supplierIds.add(item.supplierId);
    relations.push(relation);
  }
  return relations;
};

const validateUpdateProduct = (body: unknown): UpdateProductDto => {
  if (!isRecord(body)) throw new ApiError(400, "Los datos del producto no son válidos.");
  const allowedFields = ["measurementUnit", "sku", "shortname", "longname", "description", "price", "stock", "stockMin", "discount", "categoryId", "isActive", "supplierRelations"];
  if (!Object.keys(body).length || Object.keys(body).some((key) => !allowedFields.includes(key))) {
    throw new ApiError(400, "Indicá únicamente los campos permitidos del producto.");
  }
  const data: UpdateProductDto = {};
  for (const key of ["sku", "shortname", "longname"] as const) {
    const value = body[key];
    if (value === undefined) continue;
    if (key === "sku" && (value === null || value === "")) { data.sku = null; continue; }
    if (typeof value !== "string" || !value.trim() || value.trim().length > 255) {
      throw new ApiError(400, "El SKU y los nombres deben tener entre 1 y 255 caracteres.");
    }
    data[key] = key === "sku" ? value.trim().toUpperCase() : value.trim();
  }
  if (body.measurementUnit !== undefined) {
    if (!isMeasurementUnit(body.measurementUnit)) throw new ApiError(400, "La unidad de medida no es válida.");
    data.measurementUnit = body.measurementUnit;
  }
  if (body.description !== undefined) {
    if (body.description !== null && (typeof body.description !== "string" || body.description.length > 5000)) {
      throw new ApiError(400, "La descripción debe ser texto de hasta 5000 caracteres.");
    }
    data.description = typeof body.description === "string" ? body.description.trim() : null;
  }
  for (const key of ["price", "stock", "stockMin", "discount"] as const) {
    const value = body[key];
    if (value === undefined) continue;
    const quantity = key === "stock" || key === "stockMin";
    if (!isValidDecimal(value, quantity ? 3 : 2) || (key === "discount" && value > 99999999.99)) {
      throw new ApiError(400, "Usá importes no negativos con hasta dos decimales y cantidades con hasta tres.");
    }
    if (quantity && data.measurementUnit !== undefined && !isValidProductQuantity(value, data.measurementUnit)) {
      throw new ApiError(400, "Unidades y cajas solo admiten cantidades enteras.");
    }
    data[key] = value;
  }
  if (body.categoryId !== undefined) {
    if (!isPositiveId(body.categoryId)) throw new ApiError(400, "La categoría no es válida.");
    data.categoryId = body.categoryId;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") throw new ApiError(400, "El estado del producto no es válido.");
    data.isActive = body.isActive;
  }
  if (body.supplierRelations !== undefined) {
    data.supplierRelations = validateSupplierRelations(body.supplierRelations);
  }
  if (!Object.keys(data).length) throw new ApiError(400, "Indicá al menos un campo para modificar.");
  return data;
};

const validateCreateProduct = (body: unknown): CreateProductDto => {
  const data = validateUpdateProduct(body);
  if (data.shortname === undefined || data.longname === undefined || data.price === undefined || data.categoryId === undefined) {
    throw new ApiError(400, "Los nombres, el precio y la categoría son obligatorios.");
  }
  const unit = data.measurementUnit ?? "UNIT";
  if (![data.stock ?? 0, data.stockMin ?? 0].every((value) => isValidProductQuantity(value, unit))) {
    throw new ApiError(400, "Unidades y cajas solo admiten stock entero.");
  }
  return {
      sku: data.sku ?? null, measurementUnit: data.measurementUnit ?? "UNIT", shortname: data.shortname, longname: data.longname,
      price: data.price, categoryId: data.categoryId,
      description: data.description ?? null, stock: data.stock ?? 0,
      stockMin: data.stockMin ?? 0, discount: data.discount ?? 0, isActive: data.isActive ?? true,
      ...(data.supplierRelations !== undefined && { supplierRelations: data.supplierRelations }),
  };
};

export { validateCreateProduct, validateUpdateProduct };
