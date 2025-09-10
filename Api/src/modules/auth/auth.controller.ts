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

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getProfile(req.user!.id);
    return res.json({ user });
  } catch {
    return res.status(500).json({ error: 'Error al obtener el perfil' });
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

  await authService.logout(parse.data.refreshToken);
  return res.json({ ok: true });
};

export const recoverPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.recoverPassword(email);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
