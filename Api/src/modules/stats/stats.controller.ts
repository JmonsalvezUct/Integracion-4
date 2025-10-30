import type { Request, Response } from 'express';
import { statsService } from './stats.service.js';
import { z } from 'zod';

const StatsRequestSchema = z.object({
  userId: z.number().int("userId debe ser un número entero"),
  from: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido. Debe ser YYYY-MM-DD"),
  to: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido. Debe ser YYYY-MM-DD")

});

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const validation = StatsRequestSchema.safeParse({
      ...req.body,
      userId: Number(req.body.userId)
    });

    if (!validation.success) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR', 
        details: validation.error.flatten() 
      });
    }

    const { userId, from, to } = validation.data;

    const stats = await statsService.getUserStats(userId, from, to);
    return res.json(stats);
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ 
      error: error.message || 'Error al obtener estadísticas' 
    });
  }
};
