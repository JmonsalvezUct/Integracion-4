import { prisma } from '../../app/loaders/prisma.js';
import type { CreateTaskDTO, UpdateTaskDTO, TaskFiltersDTO } from './tasks.validators.js';
import type { StatusType, PriorityType, Prisma } from '@prisma/client';

// --- NUEVO CÓDIGO AÑADIDO ---
// Tipo completo para la tarea exportada (lo usaremos en el servicio y exportador)
export type FullTask = Prisma.TaskGetPayload<{
  include: {
    assignee: true;
    creator: true;
    project: true;
    attachments: true;
    tags: { include: { tag: true } };
    sprint: true;
    times: { include: { user: true } };
    history: { include: { user: true } };
  };
}>;
// --- FIN DE CÓDIGO AÑADIDO ---

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

  updateTask: (taskId: number, data: UpdateTaskDTO) =>
    prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        project: true,
        assignee: true,
        creator: true,
        tags: { include: { tag: true } },
      },
    }),

  deleteTask: (taskId: number) =>
    prisma.task.delete({
      where: { id: taskId },
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

  // --- NUEVO CÓDIGO AÑADIDO ---
  getTasksForExport: (
    projectId: number,
    taskIds?: number[],
    filters?: TaskFiltersDTO
  ) => {
    
    const where: Prisma.TaskWhereInput = {
      projectId: projectId,
    };

    // Si se provee una lista de IDs (selección manual), tiene prioridad
    if (taskIds && taskIds.length > 0) {
      where.id = { in: taskIds };
    } 
    // Si no, se usan los filtros
    else if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.priority) {
        where.priority = filters.priority;
      }
      if (filters.assigneeId) {
        // Permitir filtrar por "sin asignar" (null) si se pasa 0 o un ID negativo
        where.assigneeId = filters.assigneeId > 0 ? filters.assigneeId : null;
      }
      if (filters.sprintId) {
         where.sprintId = filters.sprintId > 0 ? filters.sprintId : null;
      }
    }
    // Si no hay IDs ni filtros, se exporta todo el proyecto (comportamiento por defecto)

    return prisma.task.findMany({
      where,
      include: {
        // Incluimos toda la información relacionada como se pidió
        assignee: true,
        creator: true,
        project: true,
        attachments: true,
        tags: { include: { tag: true } },
        sprint: true,
        times: { include: { user: true } },
        history: { 
          include: { user: true }, 
          orderBy: { createdAt: 'desc' } 
        },
      },
      orderBy: { createdAt: 'asc' }, // Ordenar para que el reporte sea lógico
    });
  },
  // --- FIN DE CÓDIGO AÑADIDO ---
};