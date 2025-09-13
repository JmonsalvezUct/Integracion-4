import rateLimit from "express-rate-limit";

// Rate limit para toda la API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máx. 100 requests por IP en ese tiempo
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
  },
});

// Rate limit más estricto para auth (login, recover-password)
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // Máx. 5 intentos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Demasiados intentos fallidos. Intenta más tarde.",
  },
});
