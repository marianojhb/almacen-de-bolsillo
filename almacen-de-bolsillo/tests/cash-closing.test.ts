import assert from "node:assert/strict";
import test from "node:test";

import { calculateCashClosing } from "../frontend/utils/cash-closing";

test("uses the latest closing as opening and only includes later operations", () => {
  const result = calculateCashClosing({
    now: new Date("2026-10-25T18:00:00.000Z"),
    balances: [
      { id: 1, date: "2026-10-25T12:00:00.000Z", actualClosing: 500 },
      { id: 2, date: "2026-10-25T15:00:00.000Z", actualClosing: 800 },
    ],
    sales: [
      { date: "2026-10-25T14:00:00.000Z", total: 999, paymentMethod: "EFECTIVO", isActive: true },
      { date: "2026-10-25T16:00:00.000Z", total: 200, paymentMethod: "EFECTIVO", isActive: true },
      { date: "2026-10-25T16:30:00.000Z", total: 300, paymentMethod: "MERCADOPAGO", isActive: true },
      { date: "2026-10-25T17:00:00.000Z", total: 400, paymentMethod: "UALA", isActive: true },
      { date: "2026-10-25T17:30:00.000Z", total: 100, paymentMethod: "EFECTIVO", isActive: false },
    ],
    transactions: [
      { date: "2026-10-25T16:45:00.000Z", amount: 50, paymentMethod: "EFECTIVO", direction: "EXPENSE" },
      { date: "2026-10-25T17:15:00.000Z", amount: 70, paymentMethod: "MERCADOPAGO", direction: "EXPENSE" },
    ],
  });

  assert.equal(result.opening, 800);
  assert.equal(result.cashSales, 200);
  assert.equal(result.cashExpenses, 50);
  assert.equal(result.mercadoPagoSales, 300);
  assert.equal(result.ualaSales, 400);
  assert.equal(result.expectedClosing, 950);
  assert.equal(result.from.toISOString(), "2026-10-25T15:00:00.000Z");
});

test("starts at local midnight with zero opening when no previous closing exists", () => {
  const now = new Date(2026, 9, 25, 18, 0, 0);
  const beforeToday = new Date(2026, 9, 24, 23, 59, 59).toISOString();
  const today = new Date(2026, 9, 25, 0, 0, 0).toISOString();
  const result = calculateCashClosing({
    now,
    balances: [],
    sales: [
      { date: beforeToday, total: 900, paymentMethod: "EFECTIVO", isActive: true },
      { date: today, total: 100, paymentMethod: "EFECTIVO", isActive: true },
    ],
    transactions: [],
  });

  assert.equal(result.opening, 0);
  assert.equal(result.cashSales, 100);
  assert.equal(result.expectedClosing, 100);
  assert.equal(result.from.getHours(), 0);
  assert.equal(result.from.getMinutes(), 0);
});

test("calculates actual difference with currency precision", () => {
  const result = calculateCashClosing({
    now: new Date("2026-10-25T18:00:00.000Z"),
    balances: [],
    sales: [{ date: "2026-10-25T16:00:00.000Z", total: 100.1, paymentMethod: "EFECTIVO", isActive: true }],
    transactions: [
      { date: "2026-10-25T17:00:00.000Z", amount: 0.2, paymentMethod: "EFECTIVO", direction: "EXPENSE" },
    ],
  });

  assert.equal(result.expectedClosing, 99.9);
  assert.equal(result.getDifference(100), 0.1);
});
