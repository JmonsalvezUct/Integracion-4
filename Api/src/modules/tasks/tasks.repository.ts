import { prisma } from '../../app/loaders/prisma.js';
import type { CreateTaskDTO, UpdateTaskDTO } from './tasks.validators.js';
import type { StatusType, PriorityType } from '@prisma/client';

export const tasksRepository = {
  createTask: (data: CreateTaskDTO) => prisma.task.create({ data }),

  getTasks: () => prisma.task.findMany({
    include: {
      assignee: true,
      creator: true,
      project: true,
    },
  }),

  getTaskById: (taskId: number) =>
    prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        creator: true,
        project: true,
        attachments: true,
      },
    }),

  updateTask: (id: number, data: UpdateTaskDTO) =>
    prisma.task.update({ where: { id }, data }),

  deleteTask: (id: number) =>
    prisma.task.delete({ where: { id } }),

  getTasksByProject: (projectId: number) =>
    prisma.task.findMany({
      where: {
        projectId: projectId
      },
      include: {
        assignee: true,
        creator: true,
        project: true,
        attachments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),

  assignTask: (id: number, assigneeId: number) =>
    prisma.task.update({
      where: { id },
      data: { assigneeId },
    }),

  changeStatus: (id: number, status: StatusType) =>
    prisma.task.update({
      where: { id },
      data: { status },
    }),

  changePriority: (id: number, priority: PriorityType) =>
    prisma.task.update({
      where: { id },
      data: { priority },
    }),
};
