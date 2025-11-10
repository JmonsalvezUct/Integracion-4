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



const GroupStatsRequestSchema = z.object({
  from: z.string()
    .optional()
    .refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), "Formato de fecha inválido. Debe ser YYYY-MM-DD"),
  to: z.string()
    .optional()
    .refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), "Formato de fecha inválido. Debe ser YYYY-MM-DD"),
});

export const getGroupStats = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR', 
        details: { projectId: 'projectId debe ser un número válido' } 
      });
    }

    const validation = GroupStatsRequestSchema.safeParse(req.body || {});
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR', 
        details: validation.error.flatten() 
      });
    }

    const { from, to } = validation.data;
    const stats = await statsService.getGroupStats(projectId, from, to);

    return res.json(stats);
  } catch (error: any) {
    console.error('Error al obtener estadísticas grupales:', error);
    return res.status(500).json({ 
      error: error.message || 'Error al obtener estadísticas grupales' 
    });
  }
};
