import { prisma } from '../../app/loaders/prisma.js';
import type { CreateTaskDTO, UpdateTaskDTO } from './tasks.validators.js';
import type { StatusType, PriorityType } from '@prisma/client';

export const tasksRepository = {
  createTask: (data: CreateTaskDTO & { creatorId: number }) =>
    prisma.task.create({
      data,
      include: {
        project: true,
        assignee: true,
        creator: true,
        tags: { include: { tag: true } }, 
      },
    }),

  getTasks: () =>
    prisma.task.findMany({
      include: {
        assignee: true,
        creator: true,
        project: true,
        attachments: true,
        tags: { include: { tag: true } }, 
      },
      orderBy: { createdAt: 'desc' },
    }),
  getTaskById: (taskId: number) =>
    prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        creator: true,
        project: true,
        attachments: true,
        tags: { include: { tag: true } }, 
      },
    }),

  updateTask: (id: number, data: UpdateTaskDTO) =>
    prisma.task.update({
      where: { id },
      data,
      include: {
        project: true,
        assignee: true,
        creator: true,
        tags: { include: { tag: true } }, 
      },
    }),

  deleteTask: (id: number) =>
    prisma.task.delete({
      where: { id },
    }),

  getTasksByProject: (projectId: number) =>
    prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: true,
        creator: true,
        project: true,
        attachments: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),

  assignTask: (taskId: number, assigneeId: number) =>
    prisma.task.update({
      where: { id: taskId },
      data: { assigneeId },
    }),

  changeStatus: (taskId: number, status: StatusType) =>
    prisma.task.update({
      where: { id: taskId },
      data: { status },
    }),

  changePriority: (id: number, priority: PriorityType) =>
    prisma.task.update({
      where: { id },
      data: { priority },
    }),
};
