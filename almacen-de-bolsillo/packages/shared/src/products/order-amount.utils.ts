// Multiplicar centavos por milésimas con enteros evita errores de coma flotante.
// Se redondea cada renglón a centavos antes de sumar el comprobante.
export function lineAmount(quantity: number, price: number, discount = 0): number {
  const grossCents = (BigInt(Math.round(quantity * 1000)) * BigInt(Math.round(price * 100)) + 500n) / 1000n;
  return Number(grossCents - BigInt(Math.round(discount * 100))) / 100;
}

export const sumAmounts = (values: readonly number[]) => values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100;
