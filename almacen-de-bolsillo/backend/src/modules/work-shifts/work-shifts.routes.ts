import { Router } from "express";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";
import {
  getMyWorkShifts, getWorkShiftById, getWorkShiftEmployees, getWorkShifts,
  patchWorkShift, postCancelWorkShift, postFinishWorkShift, postStartWorkShift,
} from "./work-shifts.controller.js";
import { getWorkShiftTypes, getWorkShiftTypeById, removeWorkShiftType, patchWorkShiftType, postWorkShiftType } from "./work-shift-types.controller.js";
import {
  getCalendar, getMyCalendar, getNonWorkingDayById, patchNonWorkingDay,
  postCancelNonWorkingDay, postCalendarAssignments, previewCalendarAssignments,
} from "./work-shift-calendar.controller.js";

const workShiftsRouter: Router = Router();
workShiftsRouter.use(requireAuth);

// Rutas con nombre antes de /:id para no confundirlas con identificadores.
workShiftsRouter.get("/types", requirePermission("work_shifts.read"), getWorkShiftTypes);
workShiftsRouter.get("/types/:typeId", requirePermission("work_shifts.read"), getWorkShiftTypeById);
workShiftsRouter.post("/types", requirePermission("work_shifts.manage"), postWorkShiftType);
workShiftsRouter.patch("/types/:typeId", requirePermission("work_shifts.manage"), patchWorkShiftType);
workShiftsRouter.delete("/types/:typeId", requirePermission("work_shifts.manage"), removeWorkShiftType);
workShiftsRouter.get("/calendar/mine", getMyCalendar);
workShiftsRouter.get("/calendar", requirePermission("work_shifts.read"), getCalendar);
workShiftsRouter.post("/calendar/preview-batch", requirePermission("work_shifts.manage"), previewCalendarAssignments);
workShiftsRouter.post("/calendar/assign-batch", requirePermission("work_shifts.manage"), postCalendarAssignments);
workShiftsRouter.get("/non-working-days/:dayId", getNonWorkingDayById);
workShiftsRouter.patch("/non-working-days/:dayId", requirePermission("work_shifts.manage"), patchNonWorkingDay);
workShiftsRouter.post("/non-working-days/:dayId/cancel", requirePermission("work_shifts.manage"), postCancelNonWorkingDay);

// Las rutas propias no necesitan el permiso de consultar a todos los empleados.
workShiftsRouter.get("/mine", getMyWorkShifts);
workShiftsRouter.get("/employees", requirePermission("work_shifts.read"), getWorkShiftEmployees);
workShiftsRouter.get("/", requirePermission("work_shifts.read"), getWorkShifts);
workShiftsRouter.get("/:id", getWorkShiftById);
workShiftsRouter.patch("/:id", requirePermission("work_shifts.manage"), patchWorkShift);
workShiftsRouter.post("/:id/cancel", requirePermission("work_shifts.manage"), postCancelWorkShift);
workShiftsRouter.post("/:id/start", postStartWorkShift);
workShiftsRouter.post("/:id/finish", postFinishWorkShift);

export default workShiftsRouter;
