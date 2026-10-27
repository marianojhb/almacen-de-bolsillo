import assert from "node:assert/strict";
import test from "node:test";

import { calculateProfitability } from "./profitability.service.js";

test("calcula el resultado con ingresos, egresos, aportes, retiros y stock", () => {
  const summary = calculateProfitability({
    balances: [
      { movementType: "R", cashIn: 1500, cashOut: 400 },
      { movementType: "C", cashIn: 300, cashOut: 100 },
    ],
    sales: [
      { total: 200, paymentMethod: "MERCADOPAGO", isActive: true },
      { total: 50, paymentMethod: "UALA", isActive: true },
      { total: 500, paymentMethod: "EFECTIVO", isActive: true },
      { total: 100, paymentMethod: "MERCADOPAGO", isActive: false },
    ],
    products: [
      {
        id: 1,
        stock: 10,
        suppliers: [
          { price: 80, pricePerPaq: 960, unitsPerPaq: 12 },
          { price: 75, pricePerPaq: 900, unitsPerPaq: 12 },
        ],
      },
    ],
  });

  assert.deepEqual(summary, {
    income: 500,
    digitalIncome: 250,
    expenses: 400,
    contributions: 300,
    withdrawals: 100,
    inventoryValue: 750,
    result: 900,
    unvaluedProducts: 0,
    unvaluedUnits: 0,
  });
});

test("reconoce ventas en efectivo sin duplicarlas al cerrar la caja", () => {
  const summary = calculateProfitability({
    balances: [{ movementType: "R", cashIn: 700, cashOut: 0 }],
    sales: [
      { total: 500, paymentMethod: "EFECTIVO", isActive: true },
      { total: 200, paymentMethod: "EFECTIVO", isActive: false },
    ],
    products: [],
  });

  assert.equal(summary.income, 500);
  assert.equal(summary.result, 500);
});

test("deriva el precio unitario del paquete cuando falta price_pos", () => {
  const summary = calculateProfitability({
    balances: [],
    sales: [],
    products: [
      {
        id: 1,
        stock: 5,
        suppliers: [
          { price: null, pricePerPaq: 1200, unitsPerPaq: 12 },
          { price: 110, pricePerPaq: 1100, unitsPerPaq: 10 },
        ],
      },
    ],
  });

  assert.equal(summary.inventoryValue, 500);
  assert.equal(summary.result, 500);
});

test("informa el stock que no tiene un precio de proveedor utilizable", () => {
  const summary = calculateProfitability({
    balances: [],
    sales: [],
    products: [
      { id: 1, stock: 8, suppliers: [] },
      { id: 2, stock: 3, suppliers: [{ price: null, pricePerPaq: 100, unitsPerPaq: 0 }] },
      { id: 3, stock: 0, suppliers: [] },
    ],
  });

  assert.equal(summary.inventoryValue, 0);
  assert.equal(summary.unvaluedProducts, 2);
  assert.equal(summary.unvaluedUnits, 11);
});

test("redondea los importes monetarios a centavos", () => {
  const summary = calculateProfitability({
    balances: [{ movementType: "R", cashIn: 999, cashOut: 0.2 }],
    sales: [{ total: 0.1, paymentMethod: "EFECTIVO", isActive: true }],
    products: [
      { id: 1, stock: 1, suppliers: [{ price: null, pricePerPaq: 1, unitsPerPaq: 3 }] },
    ],
  });

  assert.equal(summary.inventoryValue, 0.33);
  assert.equal(summary.result, 0.23);
});
