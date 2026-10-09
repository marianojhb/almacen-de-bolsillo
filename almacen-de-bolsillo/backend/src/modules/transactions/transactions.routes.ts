import { Router } from "express";
import { getTransactions, getTransactionById, postTransaction, updateTransaction, deleteTransaction } from "./transactions.controller.js";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";

const transactionsRouter: Router = Router();
transactionsRouter.use(requireAuth);

transactionsRouter.get("/", requirePermission("transactions.read"), getTransactions);
transactionsRouter.get("/:id", requirePermission("transactions.read"), getTransactionById);
transactionsRouter.post("/", requirePermission("transactions.manage"), postTransaction);
transactionsRouter.put("/:id", requirePermission("transactions.manage"), updateTransaction);
transactionsRouter.delete("/:id", requirePermission("transactions.manage"), deleteTransaction);

export default transactionsRouter;
