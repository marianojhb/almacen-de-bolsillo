import { isValidProductQuantity, type MeasurementUnit } from "@almacen/shared";
import { ApiError } from "../auth/request.utils.js";

export function assertProductQuantity(value: number, unit: MeasurementUnit) {
  if (!isValidProductQuantity(value, unit)) throw new ApiError(400, "La cantidad no es válida: unidades y cajas requieren enteros; kg y litros admiten hasta tres decimales.");
}

export function assertProductUnitChange(current: MeasurementUnit, next: MeasurementUnit, stock: number, hasHistory: boolean) {
  if (current !== next && (stock !== 0 || hasHistory)) {
    throw new ApiError(409, "No se puede cambiar la unidad de un producto con stock o historial. Creá otro producto para la nueva unidad.");
  }
}
