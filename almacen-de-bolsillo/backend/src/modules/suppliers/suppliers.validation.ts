import { ApiError } from "../auth/request.utils.js";
import { isValidDecimal, normalizePhoneContact } from "@almacen/shared";
import type { CreateSupplierDto, UpdateSupplierDto, CreateProductOnSupplierFromSupplierDto } from "@almacen/shared";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPositiveId = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 2147483647;

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const validateProductIds = (value: unknown): number[] | CreateProductOnSupplierFromSupplierDto[] => {
  if (!Array.isArray(value)) throw new ApiError(400, "La lista de productos no es válida.");
  if (value.every(isPositiveId)) {
    if (new Set(value).size !== value.length) throw new ApiError(400, "La lista contiene productos repetidos.");
    return value;
  }

  const relations: CreateProductOnSupplierFromSupplierDto[] = [];
  const productIds = new Set<number>();
  const allowedFields = ["productId", "pricePerPaq", "price", "unitsPerPaq", "minimumQuantity", "leadTimeDays", "supplierCategory", "salesTerms"];
  for (const item of value) {
    if (!isRecord(item) || Object.keys(item).some((key) => !allowedFields.includes(key))) {
      throw new ApiError(400, "Usá una lista de IDs o una lista de productos con sus condiciones, sin mezclar ambos formatos.");
    }
    if (!isPositiveId(item.productId) || productIds.has(item.productId) || !isValidDecimal(item.pricePerPaq, 2)) {
      throw new ApiError(400, "Revisá los IDs, precios y productos repetidos.");
    }
    const relation: CreateProductOnSupplierFromSupplierDto = { productId: item.productId, pricePerPaq: item.pricePerPaq };
    for (const key of ["price", "unitsPerPaq", "minimumQuantity", "leadTimeDays"] as const) {
      const field = item[key];
      if (field === undefined) continue;
      if (field !== null && (!isNonNegativeNumber(field) ||
        ((key === "unitsPerPaq" || key === "leadTimeDays") && (!Number.isInteger(field) || field > 2147483647)) ||
        (key === "unitsPerPaq" && field < 1) ||
        (key === "price" && !isValidDecimal(field, 2)) || (key === "minimumQuantity" && !isValidDecimal(field, 3)))) {
        throw new ApiError(400, "Las cantidades, los precios y los plazos del producto no son válidos.");
      }
      relation[key] = field;
    }
    for (const key of ["supplierCategory", "salesTerms"] as const) {
      const field = item[key];
      if (field === undefined) continue;
      if (field !== null && (typeof field !== "string" || field.length > 1000)) {
        throw new ApiError(400, "La categoría y las condiciones del producto no son válidas.");
      }
      relation[key] = typeof field === "string" ? field.trim() : null;
    }
    productIds.add(item.productId);
    relations.push(relation);
  }
  return relations;
};

const validateUpdateSupplier = (body: unknown): UpdateSupplierDto => {
  if (!isRecord(body)) throw new ApiError(400, "Los datos del proveedor no son válidos.");
  const allowedFields = ["name", "cuit", "phoneCountryCode", "phone", "email", "address", "isActive", "productIds"];
  if (!Object.keys(body).length || Object.keys(body).some((key) => !allowedFields.includes(key))) {
    throw new ApiError(400, "Indicá únicamente los campos permitidos del proveedor.");
  }
  const data: UpdateSupplierDto = {};
  for (const key of ["name", "cuit"] as const) {
    const value = body[key];
    if (value === undefined) continue;
    if (key === "cuit" && (value === null || value === "")) { data.cuit = null; continue; }
    const limit = key === "name" ? 150 : 30;
    if (typeof value !== "string" || !value.trim() || value.trim().length > limit) {
      throw new ApiError(400, `El ${key === "name" ? "nombre" : "CUIT"} debe tener entre 1 y ${limit} caracteres.`);
    }
    data[key] = value.trim();
  }
  for (const key of ["email", "address"] as const) {
    const value = body[key];
    if (value === undefined) continue;
    const limit = key === "email" ? 254 : 500;
    if (value !== null && (typeof value !== "string" || value.trim().length > limit)) {
      throw new ApiError(400, "El teléfono, correo o dirección no son válidos.");
    }
    const text = typeof value === "string" ? value.trim() : "";
    if (key === "email" && text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      throw new ApiError(400, "El correo del proveedor no es válido.");
    }
    data[key] = text ? (key === "email" ? text.toLowerCase() : text) : null;
  }
  if (body.phone !== undefined || body.phoneCountryCode !== undefined) {
    if (body.phone === undefined || body.phoneCountryCode === undefined) throw new ApiError(400, "Enviá juntos el código de país y el número de teléfono.");
    try { Object.assign(data, normalizePhoneContact(body.phoneCountryCode, body.phone)); }
    catch (error) { throw new ApiError(400, error instanceof Error ? error.message : "El teléfono no es válido."); }
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") throw new ApiError(400, "El estado del proveedor no es válido.");
    data.isActive = body.isActive;
  }
  if (body.productIds !== undefined) {
    data.productIds = validateProductIds(body.productIds);
  }
  if (!Object.keys(data).length) throw new ApiError(400, "Indicá al menos un campo para modificar.");
  return data;
};

const validateCreateSupplier = (body: unknown): CreateSupplierDto => {
  if (isRecord(body) && Object.keys(body).some((key) => !["name", "cuit", "phoneCountryCode", "phone", "email", "address"].includes(key))) {
    throw new ApiError(400, "Para crear un proveedor indicá solo sus datos de contacto y CUIT.");
  }
  const data = validateUpdateSupplier(body);
  if (data.name === undefined) {
    throw new ApiError(400, "El nombre del proveedor es obligatorio.");
  }
  return {
      name: data.name, cuit: data.cuit ?? null,
      ...(data.phoneCountryCode !== undefined && { phoneCountryCode: data.phoneCountryCode }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.address !== undefined && { address: data.address }),
  };
};

export { validateCreateSupplier, validateUpdateSupplier };
