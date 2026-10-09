import { isValidDecimal } from "@almacen/shared";
import { readBody, readDate, ApiError } from "../auth/request.utils.js";

type BalanceData = {
  date?: Date;
  opening?: number;
  cashIn?: number;
  cashOut?: number;
  expectedClosing?: number;
  actualClosing?: number;
  difference?: number;
};

export const validateBalance = (body: unknown, creating: boolean): BalanceData => {
  const fields = ["opening", "cashIn", "cashOut", "expectedClosing", "actualClosing", "difference"] as const;
  const source = readBody(body, [...fields, "date"]);
  const data: BalanceData = {};
  for (const field of fields) {
    if (source[field] !== undefined) {
      const value = source[field];
      if (!isValidDecimal(value, 2, field === "difference")) {
        throw new ApiError(400, `El campo ${field} debe ser un importe válido de hasta dos decimales y máximo 9.999.999.999,99 en valor absoluto. Solo difference admite negativos.`);
      }
      data[field] = value;
    } else if (creating) throw new ApiError(400, `El campo ${field} es obligatorio.`);
  }
  if (source.date !== undefined) data.date = readDate(source.date);
  return data;
};
