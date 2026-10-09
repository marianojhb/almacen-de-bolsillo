import { Router } from "express";
import { registerCommerce, login, getCurrentSession, logout } from "./auth.controller.js";
import { loginLimiter } from "./auth.limiter.js";
import { requireAuth } from "./auth.middleware.js";

const authRouter: Router = Router();

authRouter.post("/register-commerce", registerCommerce);
authRouter.post("/login", loginLimiter, login);
authRouter.get("/me", requireAuth, getCurrentSession);
authRouter.post("/logout", requireAuth, logout);

export default authRouter;
