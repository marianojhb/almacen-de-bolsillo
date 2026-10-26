import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const schemaUrl = new URL("./schema.prisma", import.meta.url);
const migrationUrl = new URL(
  "./migrations/20261025000000_add_balance_employee/migration.sql",
  import.meta.url,
);

test("el esquema relaciona balances con empleados sin invalidar balances históricos", async () => {
  const schema = await readFile(schemaUrl, "utf8");

  assert.match(schema, /employeeId\s+Int\?\s+@map\("id_employee_e"\)/);
  assert.match(
    schema,
    /employee\s+Employee\?\s+@relation\(fields: \[employeeId\], references: \[id\], onDelete: Restrict, onUpdate: Cascade\)/,
  );
  assert.match(schema, /balances\s+Balance\[\]/);
  assert.match(schema, /@@index\(\[employeeId\]\)/);
});

test("la migración agrega una referencia nullable sin atribuir balances existentes", async () => {
  const migration = await readFile(migrationUrl, "utf8");

  assert.match(migration, /ADD COLUMN\s+"id_employee_e" INTEGER;/);
  assert.match(migration, /CREATE INDEX "balance_b_id_employee_e_idx"/);
  assert.match(migration, /REFERENCES public\."employees_e" \("id_employee_e"\)/);
  assert.match(migration, /ON DELETE RESTRICT ON UPDATE CASCADE/);
  assert.doesNotMatch(migration, /\bUPDATE\s+public\."balance_b"/i);
  assert.doesNotMatch(migration, /"id_employee_e" INTEGER NOT NULL/i);
  assert.doesNotMatch(migration, /"id_employee_e" INTEGER DEFAULT/i);
});
