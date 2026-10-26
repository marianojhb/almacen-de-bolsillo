import assert from "node:assert/strict";
import test from "node:test";
import type { CreateBalanceDto } from "@almacen/shared";
import { Prisma } from "../../../generated/prisma/client.js";
import {
  BalanceResponsibleEmployeeError,
  postBalanceToDatabase,
  type BalanceCreationRepository,
} from "./balances.service.js";

const input: CreateBalanceDto = {
  userId: 7,
  date: "2026-10-25T14:30:00.000Z",
  opening: 100,
  cashIn: 50,
  cashOut: 20,
  expectedClosing: 130,
  actualClosing: 120,
  difference: -10,
};

function createRepository(employeeId: number | null = 42) {
  const records = [{ id: 1, employeeId: null as number | null }];
  const lookups: unknown[] = [];
  const creates: Prisma.BalanceCreateInput[] = [];
  const repository: BalanceCreationRepository = {
    employee: {
      async findUnique(args) {
        lookups.push(args);
        return employeeId === null ? null : { id: employeeId };
      },
    },
    balance: {
      async create({ data }) {
        creates.push(data);
        const id = records.length + 1;
        const responsibleId = data.employee?.connect?.id;
        assert.equal(typeof responsibleId, 'number');
        assert.ok(responsibleId !== undefined);
        records.push({ id, employeeId: responsibleId });
        return {
          id,
          employeeId: responsibleId,
          date: new Date(input.date),
          opening: new Prisma.Decimal(input.opening),
          cashIn: new Prisma.Decimal(input.cashIn),
          cashOut: new Prisma.Decimal(input.cashOut),
          expectedClosing: new Prisma.Decimal(input.expectedClosing),
          actualClosing: new Prisma.Decimal(input.actualClosing),
          difference: new Prisma.Decimal(input.difference),
          createdAt: new Date(input.date),
          updatedAt: new Date(input.date),
        };
      },
    },
  };
  return { repository, records, lookups, creates };
}

test("deriva el empleado desde userId y persiste la relación sin enviar userId a Prisma", async () => {
  const fake = createRepository();
  const result = await postBalanceToDatabase(input, fake.repository);
  assert.equal(result.employeeId, 42);
  assert.deepEqual(fake.lookups, [{ where: { userId: 7 }, select: { id: true } }]);
  const { userId: _userId, ...amounts } = input;
  assert.deepEqual(fake.creates, [{ ...amounts, employee: { connect: { id: 42 } } }]);
  assert.equal(input.userId, 7);
});

test("inserta cierres consecutivos y preserva balances históricos sin responsable", async () => {
  const fake = createRepository();
  await postBalanceToDatabase(input, fake.repository);
  await postBalanceToDatabase(input, fake.repository);
  assert.deepEqual(fake.records, [
    { id: 1, employeeId: null },
    { id: 2, employeeId: 42 },
    { id: 3, employeeId: 42 },
  ]);
});

test("rechaza una cuenta sin empleado sin crear ningún balance", async () => {
  const fake = createRepository(null);
  await assert.rejects(postBalanceToDatabase(input, fake.repository), (error: unknown) => {
    assert.ok(error instanceof BalanceResponsibleEmployeeError);
    assert.equal(error.name, "BalanceResponsibleEmployeeError");
    assert.match(error.message, /identificar.*responsable/i);
    return true;
  });
  assert.equal(fake.creates.length, 0);
  assert.deepEqual(fake.records, [{ id: 1, employeeId: null }]);
});

test("propaga errores de consulta sin intentar crear el balance", async () => {
  const fake = createRepository();
  const failure = new Error("Fallo de consulta");
  fake.repository.employee.findUnique = async () => { throw failure; };
  await assert.rejects(postBalanceToDatabase(input, fake.repository), (error) => error === failure);
  assert.equal(fake.creates.length, 0);
});

test("propaga errores de persistencia sin informar un guardado exitoso", async () => {
  const fake = createRepository();
  const failure = new Error("Fallo de persistencia");
  fake.repository.balance.create = async () => { throw failure; };
  await assert.rejects(postBalanceToDatabase(input, fake.repository), (error) => error === failure);
  assert.deepEqual(fake.records, [{ id: 1, employeeId: null }]);
});
