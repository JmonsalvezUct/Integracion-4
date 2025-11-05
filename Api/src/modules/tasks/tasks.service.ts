import { tasksRepository } from './tasks.repository.js';
import { changeHistoryService } from '../change-history/changeHistory.service.js'; 
import { prisma } from '../../app/loaders/prisma.js';

import type {
  CreateTaskDTO,
  UpdateTaskDTO,
  AssignTaskDTO,
  ChangeStatusDTO,
} from './tasks.validators.js';
import { StatusType, PriorityType, ActionType } from '@prisma/client';


export const tasksService = {

  createTask: async (data: CreateTaskDTO & { userId: number }) => { //--> toma un objeto llamado data que tiene todos los datos de la tarea
    const { userId, ...rest } = data; //--> separa userid de el resto de los datos de la tarea

    const task = await tasksRepository.createTask({ //--> se crea la tarea usando el repositorio y se agrega el creator id cn el userid
      ...rest,
      creatorId: userId, 
      
    });
    
    const creator = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });


    await changeHistoryService.logChange({
      userId,
      taskId: task.id,
      action: ActionType.CREATED,
      description: `Tarea creada por ${creator?.name || "un usuario desconocido"}`,
    });

    return task;
  },


  getTasks: async () => {
    return tasksRepository.getTasks();
  },

  getTaskById: async (taskId: number) => {
    return tasksRepository.getTaskById(taskId);
  },

updateTask: async (taskId: number, data: UpdateTaskDTO & { userId: number }) => {
  const oldTask = await tasksRepository.getTaskById(taskId);
  if (!oldTask) throw new Error(`No se encontró la tarea con id ${taskId}`);

  const { userId, ...taskData } = data;
  const updatedTask = await tasksRepository.updateTask(taskId, taskData);


  const formatDate = (value: any) => {
    if (!(value instanceof Date) && isNaN(Date.parse(value))) return String(value ?? "");
    const d = new Date(value);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  for (const field of Object.keys(taskData) as (keyof UpdateTaskDTO)[]) {
    const oldValue = (oldTask as any)[field];
    const newValue = taskData[field];

    const oldValStr = formatDate(oldValue);
    const newValStr = formatDate(newValue);

    if (oldValStr !== newValStr) {

      if (field === "assigneeId") {
        const newAssignee = newValue
          ? await prisma.user.findUnique({
              where: { id: Number(newValue) },
              select: { name: true },
            })
          : null;

        await changeHistoryService.logChange({
          userId,
          taskId,
          projectId: oldTask.projectId,
          action: ActionType.UPDATED,
          description: newAssignee
            ? `Campo "Responsable" cambiado a ${newAssignee.name}`
            : `Campo "Responsable" eliminado o sin asignar`,
        });

        continue; 
      }


      await changeHistoryService.logChange({
        userId,
        taskId,
        projectId: oldTask.projectId,
        action: ActionType.UPDATED,
        description: `Campo "${String(field)}" cambiado de "${oldValStr}" a "${newValStr}"`,
      });
    }
  }

  return updatedTask;
},

  deleteTask: async (taskId: number, userId: number) => {
    const task = await tasksRepository.getTaskById(taskId); //busca la tarea por su id, si no exisre lanza error
    if (!task) {
      throw new Error(`No se encontró la tarea con id ${taskId}`);
    }
    
      const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    await changeHistoryService.logChange({ // se registra un cambio en el historial, taskid se pone en null porque ya no va a existir y se conserva projectid para que se sepa aque proyecto pertenecia
      userId,
      taskId: null, 
      projectId: task.projectId ?? null,
      action: ActionType.DELETED,
      description: `Tarea "${task.title}" (ID ${task.id}) eliminada por ${user?.name || "un usuario desconocido"}`,
    });


    await tasksRepository.deleteTask(taskId); //se elimina la tarea
  },



  getTasksByProject: async (projectId: number) => {
    return tasksRepository.getTasksByProject(projectId);
  },


  assignTask: async (taskId: number, data: AssignTaskDTO & { userId: number }) => { // se toma el id de la tarea,, los datos, el id de el usuario al que se va a asignar la tarea, y el id del usuario que esta realizado la asignacion
    const updatedTask = await tasksRepository.assignTask(taskId, data.assigneeId);

    const assignee = await prisma.user.findUnique({
    where: { id: data.assigneeId },
    select: { name: true },
  });


    const assigner = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { name: true },
    });

    await changeHistoryService.logChange({ //registra la asignacion en el historial
      userId: data.userId,
      taskId: taskId,
      projectId: updatedTask.projectId,
      action: ActionType.ASSIGNED,
      description: `Tarea asignada a ${assignee?.name || "usuario desconocido"} por ${assigner?.name || "usuario desconocido"}`,
    });

    return updatedTask;
  },


  changeStatus: async (taskId: number, data: ChangeStatusDTO & { userId: number }) => {
    const updatedTask = await tasksRepository.changeStatus(taskId, data.status as StatusType);
    const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { name: true },
  });

    await changeHistoryService.logChange({
      userId: data.userId,
      taskId: taskId,
      projectId: updatedTask.projectId,
      action: ActionType.STATUS_CHANGED,
      description: `Estado cambiado a "${data.status}" por ${user?.name || "un usuario desconocido"}`,
    });

    return updatedTask;
  },


  changePriority: async (taskId: number, priority: PriorityType, userId: number) => {
    const updatedTask = await tasksRepository.changePriority(taskId, priority);


    await changeHistoryService.logChange({
      userId,
      taskId: taskId,
      projectId: updatedTask.projectId,
      action: ActionType.PRIORITY_CHANGED, 
      description: `Prioridad cambiada a "${priority}"`,
    });

    return updatedTask;
  },
};
