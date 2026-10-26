import assert from "node:assert/strict";
import test from "node:test";
import { BalanceInputError, parseCreateBalanceInput } from "./balances.input.js";

const validInput = {
  userId: 7,
  date: "2026-10-25T14:30:00.000Z",
  opening: 100,
  cashIn: 50.25,
  cashOut: 20,
  expectedClosing: 130.25,
  actualClosing: 120,
  difference: -10.25,
};

test("acepta un cierre válido y devuelve una copia con el contrato previsto", () => {
  const result = parseCreateBalanceInput(validInput);
  assert.deepEqual(result, validInput);
  assert.notEqual(result, validInput);
});

test("acepta importes cero y efectivo esperado y diferencia negativos", () => {
  const input = { ...validInput, opening: 0, cashIn: 0, cashOut: 10, expectedClosing: -10, actualClosing: 0, difference: 10 };
  assert.deepEqual(parseCreateBalanceInput(input), input);
});

test("normaliza una fecha ISO con desplazamiento horario a UTC sin modificar la entrada", () => {
  const input = { ...validInput, date: "2026-10-25T23:30:00-03:00" };
  assert.equal(parseCreateBalanceInput(input).date, "2026-10-26T02:30:00.000Z");
  assert.equal(input.date, "2026-10-25T23:30:00-03:00");
});

test("rechaza cuerpos que no son objetos de datos", () => {
  for (const input of [undefined, null, [], "texto", 10, true]) {
    assert.throws(() => parseCreateBalanceInput(input), BalanceInputError);
  }
});

test("exige userId numérico, entero positivo y seguro", () => {
  for (const userId of [undefined, null, "7", 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, true]) {
    assert.throws(() => parseCreateBalanceInput({ ...validInput, userId }), BalanceInputError);
  }
});

test("exige todos los campos del cierre", () => {
  for (const field of Object.keys(validInput)) {
    const input: Record<string, unknown> = { ...validInput };
    delete input[field];
    assert.throws(() => parseCreateBalanceInput(input), BalanceInputError);
  }
});

test("rechaza importes no numéricos o no finitos", () => {
  for (const field of ["opening", "cashIn", "cashOut", "expectedClosing", "actualClosing", "difference"]) {
    for (const value of [null, "10", "", true, NaN, Infinity, -Infinity]) {
      assert.throws(() => parseCreateBalanceInput({ ...validInput, [field]: value }), BalanceInputError);
    }
  }
});

test("rechaza apertura, entradas, salidas y efectivo real negativos", () => {
  for (const field of ["opening", "cashIn", "cashOut", "actualClosing"]) {
    assert.throws(() => parseCreateBalanceInput({ ...validInput, [field]: -1 }), BalanceInputError);
  }
});

test("rechaza fechas ausentes, inválidas o normalizadas desde un día inexistente", () => {
  for (const date of [null, 123, "", "ayer", "2026-02-30T14:30:00.000Z", "2026-13-01T00:00:00.000Z", "2026-10-25T24:00:00.000Z", "2026-10-25"]) {
    assert.throws(() => parseCreateBalanceInput({ ...validInput, date }), BalanceInputError);
  }
});

test("rechaza campos ajenos al contrato, incluidas relaciones Prisma y employeeId", () => {
  for (const field of ["employeeId", "employee", "id", "createdAt", "updatedAt", "otro"]) {
    assert.throws(() => parseCreateBalanceInput({ ...validInput, [field]: 9 }), BalanceInputError);
  }
});

test("el error de entrada ofrece un mensaje accionable", () => {
  assert.throws(() => parseCreateBalanceInput({ ...validInput, userId: 0 }), (error: unknown) => {
    assert.ok(error instanceof BalanceInputError);
    assert.equal(error.name, "BalanceInputError");
    assert.match(error.message, /usuario/i);
    return true;
  });
});
