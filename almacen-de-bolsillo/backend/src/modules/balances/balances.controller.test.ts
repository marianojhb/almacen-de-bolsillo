import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response } from 'express';
import { createPostBalanceHandler } from './balances.controller.js';
import { BalanceResponsibleEmployeeError } from './balances.service.js';

const validInput = {
  userId: 7,
  date: '2026-10-25T14:30:00.000Z',
  opening: 100,
  cashIn: 50,
  cashOut: 20,
  expectedClosing: 130,
  actualClosing: 120,
  difference: -10,
  movementType: 'R' as const,
};

function mockResponse() {
  const statuses: number[] = [];
  const bodies: unknown[] = [];
  const response = {
    status(code: number) { statuses.push(code); return response; },
    json(body: unknown) { bodies.push(body); return response; },
  };
  return { response: response as unknown as Response, statuses, bodies };
}

test('responde 201 y entrega al servicio únicamente los datos validados y normalizados', async () => {
  const received: unknown[] = [];
  const result = { id: 12, employeeId: 42 };
  const handler = createPostBalanceHandler(async (data) => {
    received.push(data);
    return result;
  });
  const body = { ...validInput, date: '2026-10-25T11:30:00-03:00' };
  const res = mockResponse();
  await handler({ body } as Request, res.response);
  assert.deepEqual(received, [validInput]);
  assert.notEqual(received[0], body);
  assert.deepEqual(res.statuses, [201]);
  assert.deepEqual(res.bodies, [result]);
});

test('responde 400 ante datos inválidos sin llamar al servicio', async () => {
  let calls = 0;
  const handler = createPostBalanceHandler(async () => { calls++; return {}; });
  for (const body of [null, {}, { ...validInput, userId: 0 }, { ...validInput, actualClosing: -1 }, { ...validInput, employeeId: 42 }]) {
    const res = mockResponse();
    await handler({ body } as Request, res.response);
    assert.deepEqual(res.statuses, [400]);
    assert.equal(res.bodies.length, 1);
    assert.equal(typeof (res.bodies[0] as { message: unknown }).message, 'string');
  }
  assert.equal(calls, 0);
});

test('responde 422 con el mensaje de dominio si falta empleado responsable', async () => {
  const failure = new BalanceResponsibleEmployeeError();
  const handler = createPostBalanceHandler(async () => { throw failure; });
  const res = mockResponse();
  await handler({ body: validInput } as Request, res.response);
  assert.deepEqual(res.statuses, [422]);
  assert.deepEqual(res.bodies, [{ message: failure.message }]);
});

test('responde 500 sin filtrar detalles internos ni anticipar un 201', async (context) => {
  context.mock.method(console, 'error', () => {});
  const handler = createPostBalanceHandler(async () => { throw new Error('Detalle interno de persistencia'); });
  const res = mockResponse();
  await handler({ body: validInput } as Request, res.response);
  assert.deepEqual(res.statuses, [500]);
  assert.deepEqual(res.bodies, [{ message: 'Internal server error' }]);
});
