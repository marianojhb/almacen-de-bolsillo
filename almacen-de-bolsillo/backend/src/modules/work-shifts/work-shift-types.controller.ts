import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { checkPermission, readId, sendApiError } from "../auth/request.utils.js";
import { createWorkShiftType, deleteWorkShiftType, getWorkShiftType, listWorkShiftTypes, updateWorkShiftType } from "./work-shift-types.service.js";
import { readWorkShiftTypeList } from "./work-shift-types.validation.js";

export const getWorkShiftTypes = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const includeInactive = readWorkShiftTypeList(req.query);
    if (includeInactive) checkPermission(session.permissions, "work_shifts.manage");
    res.json(await listWorkShiftTypes(session.commerce.id, includeInactive));
  } catch (error) { sendApiError(res, error); }
};

export const getWorkShiftTypeById = async (req: Request, res: Response) => {
  try {
    res.json(await getWorkShiftType(readId(req.params.typeId), getRequestSession(res).commerce.id));
  } catch (error) { sendApiError(res, error); }
};

export const postWorkShiftType = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await createWorkShiftType(req.body, getRequestSession(res).commerce.id));
  } catch (error) { sendApiError(res, error); }
};

export const patchWorkShiftType = async (req: Request, res: Response) => {
  try {
    res.json(await updateWorkShiftType(readId(req.params.typeId), req.body, getRequestSession(res).commerce.id));
  } catch (error) { sendApiError(res, error); }
};

export const removeWorkShiftType = async (req: Request, res: Response) => {
  try {
    await deleteWorkShiftType(readId(req.params.typeId), getRequestSession(res).commerce.id);
    res.status(204).end();
  } catch (error) { sendApiError(res, error); }
};
