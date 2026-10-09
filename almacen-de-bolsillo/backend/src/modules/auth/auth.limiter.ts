import { rateLimit } from "express-rate-limit";

// Contador por IP de intentos de inicio sesion, en memoria. Se reinicia cuando se reinicia el backend.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Demasiados intentos de inicio de sesión. Intentá nuevamente en 15 minutos." },
});

export { loginLimiter };
