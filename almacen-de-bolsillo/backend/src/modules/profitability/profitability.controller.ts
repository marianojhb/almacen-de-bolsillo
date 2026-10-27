import type { Request, Response } from "express";

import { getProfitabilityFromDatabase } from "./profitability.service.js";

export async function getProfitability(_req: Request, res: Response): Promise<void> {
  try {
    res.json(await getProfitabilityFromDatabase());
  } catch (error) {
    console.error("Error calculating profitability:", error);
    res.status(500).json({ message: "No se pudo calcular la rentabilidad." });
  }
}
