import type { Request, Response } from 'express';
import { taskTimesService } from './taskTimes.service.js';

export const taskTimesController = {
  async createForTask(req: Request, res: Response) {
    try {
      const taskId = Number(req.params.taskId);
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ message: 'No autorizado' });

      const { durationMinutes, date, description } = req.body;

      const created = await taskTimesService.createForTask(taskId, {
        userId,
        durationMinutes: Number(durationMinutes),
        date,
        description,
      });

      res.status(201).json(created);
    } catch (error: any) {
      console.error('Error creating time entry:', error);
      res.status(500).json({ message: error?.message || 'Error interno del servidor' });
    }
  },

  async getByTask(req: Request, res: Response) {
    try {
      const taskId = Number(req.params.taskId);
      const entries = await taskTimesService.getByTask(taskId);
      res.status(200).json(entries);
    } catch (error) {
      console.error('Error fetching time entries by task:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getByUser(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const entries = await taskTimesService.getByUser(userId);
      res.status(200).json(entries);
    } catch (error) {
      console.error('Error fetching time entries by user:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async deleteEntry(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const deleted = await taskTimesService.deleteEntry(id);
      res.status(200).json(deleted);
    } catch (error: any) {
      console.error('Error deleting time entry:', error);
      res.status(500).json({ message: error?.message || 'Error interno del servidor' });
    }
  },
};
