import { ApiError } from "../auth/request.utils.js";
import type { CreateCategoryDto } from "@almacen/shared";

const validateCategory = (body: unknown): CreateCategoryDto => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ApiError(400, "Los datos de la categoría no son válidos.");
  }
  const fields = body as Record<string, unknown>;
  if (Object.keys(fields).some((key) => key !== "name")) {
    throw new ApiError(400, "Solo se puede indicar el nombre de la categoría.");
  }
  if (typeof fields.name !== "string" || !fields.name.trim() || fields.name.trim().length > 100) {
    throw new ApiError(400, "El nombre de la categoría debe tener entre 1 y 100 caracteres.");
  }
  return { name: fields.name.trim() };
};

export { validateCategory };
