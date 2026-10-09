import { Router } from "express";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";
import { getDashboardSummary } from "./dashboard.controller.js";

const dashboardRouter: Router = Router();
dashboardRouter.use(requireAuth);
dashboardRouter.get("/", requirePermission("dashboard.read"), getDashboardSummary);
export default dashboardRouter;
