import { Router } from "express";

import {
  createOwnerController,
  getSetupStatusController,
  loginController,
} from "./auth.controller.js";

const authRouter: Router = Router();

authRouter.get(
  "/setup-status",
  getSetupStatusController,
);

authRouter.post(
  "/create-owner",
  createOwnerController,
);

authRouter.post(
  "/login",
  loginController,
);

export default authRouter;