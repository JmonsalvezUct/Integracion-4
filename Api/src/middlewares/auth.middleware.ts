import {type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js';
import { body, validationResult } from "express-validator";

export interface AuthRequest extends Request {
  user?: { id: number };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: falta token' });
  }
  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token!, env.JWT_SECRET)  as { id: number }; 
    req.user = { id: decoded.id };
    next();
  } catch (error) { 
    return res.status(401).json({ error: 'Token inválido o expirado' });
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