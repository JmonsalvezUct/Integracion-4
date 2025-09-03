import {type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js';

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