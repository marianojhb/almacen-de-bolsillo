import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { ApiError, readId, sendApiError } from "../auth/request.utils.js";
import {
  cancelWorkShift, getWorkShiftByIdFromDatabase,
  getWorkShiftEmployeesFromDatabase, getWorkShiftsFromDatabase,
  recordWorkShiftAttendance, updateWorkShift,
} from "./work-shifts.service.js";
import { assertEmptyShiftActionBody, readCancelReason, readShiftFilters } from "./work-shifts.validation.js";

export const getWorkShifts = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    res.json(await getWorkShiftsFromDatabase(readShiftFilters(req.query), session));
  } catch (error) { sendApiError(res, error); }
};

export const getMyWorkShifts = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const filters = readShiftFilters(req.query);
    if (filters.employeeId !== undefined) throw new ApiError(400, "En Mis turnos no se puede seleccionar otro empleado.");
    res.json(await getWorkShiftsFromDatabase(filters, session, true));
  } catch (error) { sendApiError(res, error); }
};

export const getWorkShiftById = async (req: Request, res: Response) => {
  try {
    res.json(await getWorkShiftByIdFromDatabase(readId(req.params.id), getRequestSession(res)));
  } catch (error) { sendApiError(res, error); }
};

export const getWorkShiftEmployees = async (_req: Request, res: Response) => {
  try {
    res.json(await getWorkShiftEmployeesFromDatabase(getRequestSession(res).commerce.id));
  } catch (error) { sendApiError(res, error); }
};

export const patchWorkShift = async (req: Request, res: Response) => {
  try {
    res.json(await updateWorkShift(readId(req.params.id), req.body, getRequestSession(res)));
  } catch (error) { sendApiError(res, error); }
};

export const postCancelWorkShift = async (req: Request, res: Response) => {
  try {
    res.json(await cancelWorkShift(readId(req.params.id), readCancelReason(req.body), getRequestSession(res)));
  } catch (error) { sendApiError(res, error); }
};

const recordAttendance = async (req: Request, res: Response, action: "start" | "finish") => {
  try {
    assertEmptyShiftActionBody(req.body);
    res.json(await recordWorkShiftAttendance(readId(req.params.id), action, getRequestSession(res)));
  } catch (error) { sendApiError(res, error); }
};

export const postStartWorkShift = (req: Request, res: Response) => recordAttendance(req, res, "start");
export const postFinishWorkShift = (req: Request, res: Response) => recordAttendance(req, res, "finish");
