import { Router } from "express";

import {
  createWorkShiftTypeController,
  deactivateWorkShiftTypeController,
  getWorkShiftTypesController,
  updateWorkShiftTypeController,
} from "./work-shift-types.controller.js";

const workShiftTypesRouter: Router = Router();

workShiftTypesRouter.get(
  "/",
  getWorkShiftTypesController,
);

workShiftTypesRouter.post(
  "/",
  createWorkShiftTypeController,
);

workShiftTypesRouter.patch(
  "/:id",
  updateWorkShiftTypeController,
);

workShiftTypesRouter.delete(
  "/:id",
  deactivateWorkShiftTypeController,
);

export default workShiftTypesRouter;