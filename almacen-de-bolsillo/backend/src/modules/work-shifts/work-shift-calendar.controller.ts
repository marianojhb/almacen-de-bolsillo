import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { readId, sendApiError } from "../auth/request.utils.js";
import {
  assignWorkShiftTypes, cancelNonWorkingDay, getNonWorkingDay, getWorkShiftCalendar, previewWorkShiftAssignments, updateNonWorkingDay,
} from "./work-shift-calendar.service.js";
import { readWorkShiftCalendarFilters } from "./work-shift-types.validation.js";
import { readCancelReason } from "./work-shifts.validation.js";

export const getCalendar = async (req: Request, res: Response) => {
  try {
    res.json(await getWorkShiftCalendar(readWorkShiftCalendarFilters(req.query), getRequestSession(res)));
  } catch (error) { sendApiError(res, error); }
};

export const getMyCalendar = async (req: Request, res: Response) => {
  try {
    res.json(await getWorkShiftCalendar(readWorkShiftCalendarFilters(req.query), getRequestSession(res), true));
  } catch (error) { sendApiError(res, error); }
};

export const getNonWorkingDayById = async (req: Request, res: Response) => {
  try {
    res.json(await getNonWorkingDay(readId(req.params.dayId), getRequestSession(res)));
  } catch (error) { sendApiError(res, error); }
};

export const patchNonWorkingDay = async (req: Request, res: Response) => {
  try {
    res.json(await updateNonWorkingDay(readId(req.params.dayId), req.body, getRequestSession(res)));
  } catch (error) { sendApiError(res, error); }
};

export const postCancelNonWorkingDay = async (req: Request, res: Response) => {
  try {
    res.json(await cancelNonWorkingDay(readId(req.params.dayId), readCancelReason(req.body), getRequestSession(res)));
  } catch (error) { sendApiError(res, error); }
};

export const previewCalendarAssignments = async (req: Request, res: Response) => {
  try { res.json(await previewWorkShiftAssignments(req.body, getRequestSession(res))); }
  catch (error) { sendApiError(res, error); }
};

export const postCalendarAssignments = async (req: Request, res: Response) => {
  try { res.status(201).json(await assignWorkShiftTypes(req.body, getRequestSession(res))); }
  catch (error) { sendApiError(res, error); }
};
