import {type Request, type Response, type NextFunction } from 'express';

import { env } from '../config/env.js';
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import type { Secret, JwtPayload } from "jsonwebtoken";
import type { UserPayload } from "../types/UserPayload.js";
import type { Role } from "../config/permissions.js";
export interface AuthUser {
  id: number;
  email?: string;
  name?: string;
  role?: string;
}
export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: falta token' });
  }
  const parts = header.split(" ");
  const token = parts[1];
  if (!token) {
    return res.status(401).json({ error: "No autorizado: token mal formado" });
  }

  try {
    const secret = env.JWT_SECRET as string;

    const decoded = jwt.verify(token, secret) as JwtPayload | string;

    if (typeof decoded === "string" || !decoded) {
      return res.status(401).json({ error: "Token inválido o mal formado" });
    }

    const { id, email, name, role } = decoded as {
      id: number;
      email?: string;
      name?: string;
      role?: string;
    };

    req.user = {
  id,
  email,
  name,
  role: (role as Role) ?? "guest",
};
    next();
  } catch (error) {
    console.error("Error en authMiddleware:", error);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export const validateRecoverPassword = [
  body("email").isEmail().withMessage("Email inválido"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateResetPassword = [
  body("token").notEmpty().withMessage("El token es obligatorio"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];