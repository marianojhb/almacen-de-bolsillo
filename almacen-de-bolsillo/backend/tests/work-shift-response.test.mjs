import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import * as shared from "@almacen/shared";

// Ejecutamos el servicio con una base simulada: estas pruebas no acceden a Supabase.
const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../src/modules/work-shifts/work-shifts.service.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const session = { commerce: { id: 2, timeZone: "America/Argentina/Buenos_Aires" } };

function fixture(breaks = []) {
  return {
    id: 23, commerceId: 2, employeeId: 7, workShiftTypeId: 4,
    date: new Date("2026-10-22T00:00:00Z"),
    startsAt: new Date("2026-10-22T11:00:00Z"), endsAt: new Date("2026-10-22T15:00:00Z"),
    actualStartedAt: null, actualEndedAt: null, status: "SCHEDULED", notes: null, createdById: 9,
    createdAt: new Date("2026-10-20T00:00:00Z"), updatedAt: new Date("2026-10-21T00:00:00Z"),
    employee: { id: 7, firstname: "Ana", lastname: "Pérez", fullname: "Ana Pérez", isActive: true },
    createdBy: { id: 9, username: "gestor", firstname: "Juan", lastname: "López" },
    workShiftType: {
      id: 4, commerceId: 2, name: "Mañana", icon: "sunny-outline", iconColor: "#000000", color: "#FFCC00",
      lateToleranceMinutes: 10, breaks,
      createdAt: new Date("2026-01-01T00:00:00Z"), updatedAt: new Date("2026-01-02T00:00:00Z"),
    },
  };
}

function service(record) {
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: (name) => {
    if (name === "@almacen/shared") return shared;
    if (name === "../config/prisma.js") return { prisma: { workShift: {
      findUnique: async () => record, findMany: async () => [record],
    } } };
    if (name === "./work-shifts.access.js") return { canReadWorkShift: () => true };
    if (name === "./work-shifts.database.js") return { employeeName: (employee) => employee.fullname };
    if (name === "./work-shifts.validation.js") return { getShiftFilterIntervals: () => [{
      startsAt: new Date("2026-10-01T00:00:00Z"), endsAt: new Date("2026-11-01T00:00:00Z"),
    }] };
    if (name === "../auth/request.utils.js") return { ApiError: Error };
    return require(name);
  } });
  return exports;
}

test("consultar un turno conserva su ID, sus fechas y la presentación de la jornada", async () => {
  const record = fixture();
  const result = await service(record).getWorkShiftByIdFromDatabase(23, session);
  assert.equal(result.id, 23);
  assert.equal(result.workShiftTypeId, 4);
  assert.equal(result.name, "Mañana");
  assert.equal(result.color, "#FFCC00");
  assert.equal(result.iconColor, "#000000");
  assert.equal(result.lateToleranceMinutes, 10);
  assert.equal(result.createdAt, "2026-10-20T00:00:00.000Z");
  assert.equal(result.updatedAt, "2026-10-21T00:00:00.000Z");
  assert.equal(result.startsAt, "2026-10-22T11:00:00.000Z");
  assert.equal(result.employee.name, "Ana Pérez");
  assert.equal(result.breaks.length, 0);
  assert.equal(record.id, 23);
});

test("el calendario carga turnos existentes con descansos fijos y flexibles", async () => {
  const record = fixture([
    { id: 11, mode: "FIXED", durationMinutes: null, startTime: "10:00", endTime: "10:30", startsNextDay: false, endsNextDay: false },
    { id: 12, mode: "FLEXIBLE", durationMinutes: 15, startTime: null, endTime: null },
  ]);
  const [result] = await service(record).getWorkShiftsFromDatabase({}, session);
  assert.equal(result.id, 23);
  assert.equal(result.breaks[0].startsAt, "2026-10-22T13:00:00.000Z");
  assert.equal(result.breaks[0].endsAt, "2026-10-22T13:30:00.000Z");
  assert.equal(result.breaks[1].durationMinutes, 15);
  assert.equal(result.breaks[1].startsAt, null);
  assert.equal(result.breaks[1].endsAt, null);
});

test("un descanso nocturno respeta el día siguiente en la zona del comercio", async () => {
  const record = fixture([
    { id: 13, mode: "FIXED", durationMinutes: null, startTime: "23:45", endTime: "00:15", startsNextDay: false, endsNextDay: true },
    { id: 14, mode: "FIXED", durationMinutes: null, startTime: "02:00", endTime: "02:15", startsNextDay: true, endsNextDay: true },
  ]);
  record.startsAt = new Date("2026-10-23T01:00:00Z");
  record.endsAt = new Date("2026-10-23T09:00:00Z");
  const result = await service(record).getWorkShiftByIdFromDatabase(23, session);
  assert.equal(result.breaks[0].startsAt, "2026-10-23T02:45:00.000Z");
  assert.equal(result.breaks[0].endsAt, "2026-10-23T03:15:00.000Z");
  assert.equal(result.breaks[1].startsAt, "2026-10-23T05:00:00.000Z");
  assert.equal(result.breaks[1].endsAt, "2026-10-23T05:15:00.000Z");
});
