import assert from 'node:assert/strict';
import test from 'node:test';
import { getBalancesFromDatabase } from './balances.service.js';

test('el historial ordena por fecha e id descendentes y solicita solo la identidad del responsable', async () => {
  const queries: unknown[] = [];
  assert.deepEqual(await getBalancesFromDatabase({
    async findMany(args) { queries.push(args); return []; },
  }), []);
  assert.deepEqual(queries[0], {
    orderBy: [{ date: 'desc' }, { id: 'desc' }],
    include: {
      employee: {
        select: {
          firstname: true,
          lastname: true,
          fullname: true,
          user: { select: { email: true } },
        },
      },
    },
  });
});
