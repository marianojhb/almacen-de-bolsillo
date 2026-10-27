import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInThisContext } from "node:vm";
import ts from "typescript";

async function loadCashClosingModule() {
  const url = new URL("../utils/cash-closing.ts", import.meta.url);
  const { outputText } = ts.transpileModule(await readFile(url, "utf8"), {
    fileName: url.pathname,
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  runInThisContext(`(function(require, exports) { ${outputText}\n})`, { filename: url.pathname })(
    (name) => { throw new Error(`Dependencia inesperada: ${name}`); },
    exports,
  );
  return exports;
}

const now = new Date("2026-10-26T18:30:00.000Z");

test("un aporte crea un nuevo balance con el importe en cashIn", async () => {
  const { createCashMovementBalance } = await loadCashClosingModule();

  assert.deepEqual(createCashMovementBalance({
    userId: 7,
    now,
    currentCash: 130,
    amount: 50.25,
    type: "cashIn",
  }), {
    userId: 7,
    date: now.toISOString(),
    opening: 130,
    cashIn: 50.25,
    cashOut: 0,
    expectedClosing: 180.25,
    actualClosing: 180.25,
    difference: 0,
    movementType: "C",
  });
});

test("un retiro crea un nuevo balance con el importe en cashOut", async () => {
  const { createCashMovementBalance } = await loadCashClosingModule();

  assert.deepEqual(createCashMovementBalance({
    userId: 7,
    now,
    currentCash: 130,
    amount: 30,
    type: "cashOut",
  }), {
    userId: 7,
    date: now.toISOString(),
    opening: 130,
    cashIn: 0,
    cashOut: 30,
    expectedClosing: 100,
    actualClosing: 100,
    difference: 0,
    movementType: "C",
  });
});

test("rechaza importes inválidos y retiros superiores al efectivo esperado", async () => {
  const { createCashMovementBalance } = await loadCashClosingModule();
  const base = { userId: 7, now, currentCash: 100, type: "cashOut" };

  for (const amount of [0, -1, NaN, Infinity, 100.01]) {
    assert.throws(() => createCashMovementBalance({ ...base, amount }), /importe|efectivo/i);
  }
});
