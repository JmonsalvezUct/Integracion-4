import { taskTimesRepository } from './taskTimes.repository.js';
import { prisma } from '../../app/loaders/prisma.js';
import { changeHistoryService } from '../change-history/changeHistory.service.js';
import { ActionType } from '@prisma/client';

export const taskTimesService = {
  createForTask: async (taskId: number, data: { userId: number; durationMinutes: number; date?: string | Date; description?: string | null }) => {
    // verify task exists
    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { id: true, projectId: true, title: true } });
    if (!task) throw new Error(`Tarea con id ${taskId} no encontrada`);

    const created = await taskTimesRepository.create({
      taskId,
      userId: data.userId,
      durationMinutes: data.durationMinutes,
      date: data.date,
      description: data.description ?? null,
    });

    // Log to change history
    await changeHistoryService.logChange({
      userId: data.userId,
      taskId: taskId,
      projectId: task.projectId ?? null,
      action: ActionType.TIME_LOGGED,
      description: `Tiempo registrado: ${data.durationMinutes} minutos${data.description ? ` - ${data.description}` : ''}`,
    }).catch(() => {
      // don't fail main action if history log fails
    });

    return created;
  },

  getByTask: async (taskId: number) => {
    return taskTimesRepository.findByTask(taskId);
  },

  getByUser: async (userId: number) => {
    return taskTimesRepository.findByUser(userId);
  },

  deleteEntry: async (id: number) => {
    return taskTimesRepository.deleteById(id);
  },
};
