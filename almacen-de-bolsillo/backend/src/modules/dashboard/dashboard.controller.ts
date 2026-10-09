import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { getDashboardSummaryFromDatabase } from "./dashboard.service.js";

const getDashboardSummary = async (req: Request, res: Response) => {
  const from = new Date(typeof req.query.from === "string" ? req.query.from : "");
  const to = new Date(typeof req.query.to === "string" ? req.query.to : "");
  const days = (to.getTime() - from.getTime()) / 86400000;
  if (!Number.isFinite(days) || days <= 0 || days > 45) {
    res.status(400).json({ message: "El período del resumen debe ser válido y no superar 45 días." });
    return;
  }
  try {
    res.json(await getDashboardSummaryFromDatabase(getRequestSession(res).commerce.id, from, to));
  } catch {
    console.error("No se pudo cargar el resumen del comercio.");
    res.status(500).json({ message: "No se pudo cargar el dashboard. Intentá nuevamente." });
  }
};

export { getDashboardSummary };
