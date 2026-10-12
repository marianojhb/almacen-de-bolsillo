import type { Request, Response } from "express";

import { WorkShiftError } from "./work-shift-types.service.js";

import {
  createWorkShift,
  deleteWorkShift,
  getWorkShiftById,
  getWorkShifts,
  readPositiveId,
  updateWorkShift,
} from "./work-shifts.service.js";

function respondWithError(
  res: Response,
  error: unknown,
): void {
  if (error instanceof WorkShiftError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error
      ? String(error.code)
      : null;

  if (code === "P2002") {
    res.status(409).json({
      message:
        "Ese empleado ya tiene asignada esa jornada en esa fecha.",
    });
    return;
  }

  if (code === "P2025") {
    res.status(404).json({
      message: "Turno no encontrado.",
    });
    return;
  }

  if (code === "P2003") {
    res.status(409).json({
      message:
        "El empleado o la jornada ya no están disponibles.",
    });
    return;
  }

  console.error("Error de turnos laborales:", error);

  res.status(500).json({
    message: "No se pudo completar la operación.",
  });
}

export async function getWorkShiftsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const workShifts = await getWorkShifts(
      req.query.from,
      req.query.to,
    );

    res.json({ workShifts });
  } catch (error) {
    respondWithError(res, error);
  }
}

export async function getWorkShiftByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = readPositiveId(req.params.id, "turno");
    const workShift = await getWorkShiftById(id);

    res.json(workShift);
  } catch (error) {
    respondWithError(res, error);
  }
}

export async function createWorkShiftController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const workShift = await createWorkShift(req.body);

    res.status(201).json(workShift);
  } catch (error) {
    respondWithError(res, error);
  }
}

export async function updateWorkShiftController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = readPositiveId(req.params.id, "turno");

    const workShift = await updateWorkShift(
      id,
      req.body,
    );

    res.json(workShift);
  } catch (error) {
    respondWithError(res, error);
  }
}

export async function deleteWorkShiftController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = readPositiveId(req.params.id, "turno");

    await deleteWorkShift(id);

    res.status(204).send();
  } catch (error) {
    respondWithError(res, error);
  }
}