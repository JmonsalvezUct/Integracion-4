import { type Request, type Response } from 'express';
import { authService } from './auth.service.js';
import { RegisterSchema, LoginSchema, RefreshSchema } from './auth.validators.js';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';

export const register = async (req: Request, res: Response) => {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });

  try {
    const result = await authService.register(parse.data);
    return res.status(201).json(result);
  } catch (e: any) {
    if (e.message === 'EMAIL_TAKEN') return res.status(409).json({ error: 'El email ya está registrado' });
    return res.status(500).json({ error: 'Error en el registro' });
  }
};
export const me = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  return res.json({ user: req.user });
};

export const login = async (req: Request, res: Response) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });

  try {
    const ua = req.headers['user-agent']?.toString();
    const result = await authService.login(parse.data, ua);
    return res.json(result);
  } catch (e: any) {
    if (e.message === 'INVALID_CREDENTIALS') return res.status(400).json({ error: 'Credenciales inválidas' });
    return res.status(500).json({ error: 'Error en el login' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const parse = RefreshSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });

  try {
    const ua = req.headers['user-agent']?.toString();
    const result = await authService.refresh(parse.data.refreshToken, ua);
    return res.json(result);
  } catch (e: any) {
    const map: Record<string, number> = {
      REFRESH_NOT_FOUND: 404,
      REFRESH_EXPIRED: 401,
    };
    return res.status(map[e.message] ?? 500).json({ error: 'No se pudo refrescar el token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const parse = RefreshSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });

  try {
    await authService.logout(parse.data.refreshToken);
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: 'No se pudo cerrar la sesión', details: e.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    return res.json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ message: error.message || "Error al restablecer la contraseña" });
  }
};

export const recoverPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.recoverPassword(email);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
};


};
