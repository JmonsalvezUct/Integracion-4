import { tasksRepository } from './tasks.repository.js';
import { changeHistoryService } from '../change-history/changeHistory.service.js'; 
import { prisma } from '../../app/loaders/prisma.js'; 

import type {
  CreateTaskDTO,
  UpdateTaskDTO,
  AssignTaskDTO,
  ChangeStatusDTO,
} from './tasks.validators.js';
import type { StatusType, PriorityType } from '@prisma/client';

export const tasksService = {

createTask: async (data: CreateTaskDTO & { userId: number }) => { //--> toma un objeto llamado data que tiene todos los datos de la tarea
  const { userId, ...rest } = data; //--> separa userid de el resto de los datos de la tarea

  const task = await tasksRepository.createTask({ //--> se crea la tarea usando el repositorio y se agrega el creator id cn el userid
    ...rest,
    creatorId: userId, 
  });

  const action = await prisma.action.findUnique({ where: { action: "CREATED" } }); //--> se busca en la base de datos la accion de tipo created y si no la ecuentra lanza error
  if (!action) throw new Error("Action type 'CREATED' not found");

  await changeHistoryService.logChange({ //--> se usa changeHistoryService para guardar un registro de que el usuario creo la tarea
    userId,
    taskId: task.id,
    actionId: action.id,
    description: `Tarea creada por el usuario ${userId}`,
  });

  return task; //--> retorna la tarea creada
},



  getTasks: async () => {
    return tasksRepository.getTasks();
  },

  getTaskById: async (taskId: number) => {
    return tasksRepository.getTaskById(taskId);
  },

  updateTask: async (taskId: number, data: UpdateTaskDTO) => {
    return tasksRepository.updateTask(taskId, data);
  },

  deleteTask: async (taskId: number) => {
    return tasksRepository.deleteTask(taskId);
  },

  getTasksByProject: async (projectId: number) => {
    return tasksRepository.getTasksByProject(projectId);
  },

  assignTask: async (taskId: number, data: AssignTaskDTO) => {
    return tasksRepository.assignTask(taskId, data.assigneeId);
  },

  changeStatus: async (taskId: number, data: ChangeStatusDTO) => {
    return tasksRepository.changeStatus(taskId, data.status as StatusType);
  },


  changePriority: async (id: number, priority: PriorityType, userId: number) => {
    const updatedTask = await tasksRepository.changePriority(id, priority);

    const action = await prisma.action.findUnique({ where: { action: 'UPDATED' } });
    if (!action) throw new Error("Action type 'UPDATED' not found");

    await changeHistoryService.logChange({
      userId,
      taskId: id,
      actionId: action.id,
      description: `Prioridad cambiada a "${priority}"`,
    });

    return updatedTask;
  },
};
