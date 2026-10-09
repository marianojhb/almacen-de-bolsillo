import { Router } from "express";
import { getBalances, getBalanceById, postBalance, updateBalance, deleteBalance } from "./balances.controller.js";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";

const balancesRouter: Router = Router();
balancesRouter.use(requireAuth);

balancesRouter.get("/", requirePermission("balances.read"), getBalances);
balancesRouter.get("/:id", requirePermission("balances.read"), getBalanceById);
balancesRouter.post("/", requirePermission("balances.manage"), postBalance);
balancesRouter.put("/:id", requirePermission("balances.manage"), updateBalance);
balancesRouter.delete("/:id", requirePermission("balances.manage"), deleteBalance);

export default balancesRouter;
