import type { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`Error en [${req.method}] ${req.originalUrl}: ${err.message}`);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Error interno del servidor",
    timestamp: new Date(),
    path: req.originalUrl,
  });
}
