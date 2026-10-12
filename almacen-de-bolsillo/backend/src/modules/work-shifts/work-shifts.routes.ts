import { Router } from "express";

import {
  createWorkShiftController,
  deleteWorkShiftController,
  getWorkShiftByIdController,
  getWorkShiftsController,
  updateWorkShiftController,
} from "./work-shifts.controller.js";

const workShiftsRouter: Router = Router();

workShiftsRouter.get(
  "/",
  getWorkShiftsController,
);

workShiftsRouter.get(
  "/:id",
  getWorkShiftByIdController,
);

workShiftsRouter.post(
  "/",
  createWorkShiftController,
);

workShiftsRouter.patch(
  "/:id",
  updateWorkShiftController,
);

workShiftsRouter.delete(
  "/:id",
  deleteWorkShiftController,
);

export default workShiftsRouter;