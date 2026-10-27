import { Router } from "express";

import { getProfitability } from "./profitability.controller.js";

const profitabilityRouter: Router = Router();

profitabilityRouter.get("/", getProfitability);

export default profitabilityRouter;
