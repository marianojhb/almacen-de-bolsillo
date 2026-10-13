import type { Request, Response } from "express";

import {
  WorkShiftError,
  createWorkShiftType,
  deactivateWorkShiftType,
  getWorkShiftTypes,
  updateWorkShiftType,
} from "./work-shift-types.service.js";

function readId(value: unknown): number {
  if (
    typeof value !== "string" ||
    !/^[1-9]\d*$/.test(value)
  ) {
    throw new WorkShiftError(
      400,
      "El ID de la jornada no es válido.",
    );
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id)) {
    throw new WorkShiftError(
      400,
      "El ID de la jornada no es válido.",
    );
  }

  return id;
}

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
      message: "Ya existe una jornada con ese nombre.",
    });
    return;
  }

  if (code === "P2025") {
    res.status(404).json({
      message: "Jornada no encontrada.",
    });
    return;
  }

  console.error("Error de tipos de jornadas:", error);

  res.status(500).json({
    message: "No se pudo completar la operación.",
  });
}

export async function getWorkShiftTypesController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const journeys = await getWorkShiftTypes(
      req.query.includeInactive === "true",
    );

    res.json(journeys);
  } catch (error) {
    respondWithError(res, error);
  }
}

export async function createWorkShiftTypeController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const journey = await createWorkShiftType(req.body);
    res.status(201).json(journey);
  } catch (error) {
    respondWithError(res, error);
  }
}

export async function updateWorkShiftTypeController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = readId(req.params.id);
    const journey = await updateWorkShiftType(id, req.body);

    res.json(journey);
  } catch (error) {
    respondWithError(res, error);
  }
}

export async function deactivateWorkShiftTypeController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = readId(req.params.id);
    await deactivateWorkShiftType(id);

    res.status(204).send();
  } catch (error) {
    respondWithError(res, error);
  }
}