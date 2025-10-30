import { prisma } from '../../app/loaders/prisma.js';

export const taskTimesRepository = {
  create: (data: {
    taskId: number;
    userId: number;
    durationMinutes: number;
    date?: Date | string;
    description?: string | null;
  }) =>
    prisma.taskTime.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        durationMinutes: data.durationMinutes,
        date: data.date ? new Date(data.date) : undefined,
        description: data.description ?? null,
      },
      include: { user: true, task: true },
    }),

  findByTask: (taskId: number) =>
    prisma.taskTime.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { date: 'desc' },
    }),

  findByUser: (userId: number) =>
    prisma.taskTime.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { date: 'desc' },
    }),

  deleteById: (id: number) => prisma.taskTime.delete({ where: { id } }),
};
