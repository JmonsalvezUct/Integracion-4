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

  updateTask: async (taskId: number, data: UpdateTaskDTO & { userId: number }) => { //--> se ibtiene el id de la tarea que se quiere actalizar, los datos nuevos de la tarea y el userid del iusuario que la actualiza
    const oldTask = await tasksRepository.getTaskById(taskId); //--> se busca la tarea actual en la base de datos por su id y si no existe lanza error
    if (!oldTask) {
      throw new Error(`No se encontró la tarea con id ${taskId}`);
    }

    const { userId, ...taskData } = data;  // se separa el userid de los demas datos de la tarea
    const updatedTask = await tasksRepository.updateTask(taskId, taskData); // --> se actualiza la tarea con los nuevos valores


    const action = await prisma.action.findUnique({ where: { action: 'UPDATED' } }); // se busca en la tabla de acciones una que sea updated y si no existe lanza error
    if (!action) throw new Error("Action type 'UPDATED' not found");


    // ALERTA! --> investigar acerca de el uso de foreach con una funcion asincrona, yaque foreach no espera las promesas. en futuro cambiar a for..of con await
    (Object.keys(data) as (keyof UpdateTaskDTO)[]).forEach(async (field) => { //para cada campo modificado  compara el valor antiguo con el nuevo, si son diferentes, se registra un cambio en el historial
      const oldValue = oldTask[field];
      const newValue = data[field];

      if (oldValue !== newValue) {
        await changeHistoryService.logChange({
          userId: data.userId,
          taskId: taskId,
          actionId: action.id,
          description: `Campo "${String(field)}" cambiado de "${oldValue}" a "${newValue}"`,
        });
      }
    });

    return updatedTask;
  },



  deleteTask: async (taskId: number, userId: number) => {
    const task = await tasksRepository.getTaskById(taskId); //busca la tarea por su id, si no exisre lanza error
    if (!task) {
      throw new Error(`No se encontró la tarea con id ${taskId}`);
    }

    const action = await prisma.action.findUnique({ where: { action: 'DELETED' } });//busca en la tabla acciones la accion deleted
    if (!action) throw new Error("Action type 'DELETED' not found");


    await changeHistoryService.logChange({ // se registra un cambio en el historial, taskid se pone en null porque ya no va a existir y se conserva projectid para que se sepa aque proyecto pertenecia
      userId,
      taskId: null, 
      projectId: task.projectId ?? null,
      actionId: action.id,
      description: `Tarea "${task.title}" (ID ${task.id}) eliminada por el usuario ${userId}`,
    });


    await tasksRepository.deleteTask(taskId); //se elimina la tarea
  },


  getTasksByProject: async (projectId: number) => {
    return tasksRepository.getTasksByProject(projectId);
  },


  assignTask: async (taskId: number, data: AssignTaskDTO & { userId: number }) => { // se toma el id de la tarea,, los datos, el id de el usuario al que se va a asignar la tarea, y el id del usuario que esta realizado la asignacion
    const updatedTask = await tasksRepository.assignTask(taskId, data.assigneeId);

    const action = await prisma.action.findUnique({ where: { action: 'ASSIGNED' } }); //busca la accion asiigned
    if (!action) throw new Error("Action type 'ASSIGNED' not found");

    await changeHistoryService.logChange({ //registra la asignacion en el historial
      userId: data.userId,
      taskId: taskId,
      actionId: action.id,
      description: `Tarea asignada al usuario ${data.assigneeId} por ${data.userId}`,
    });

    return updatedTask;
  },


  changeStatus: async (taskId: number, data: ChangeStatusDTO & { userId: number }) => {
    const updatedTask = await tasksRepository.changeStatus(taskId, data.status as StatusType);

    const action = await prisma.action.findUnique({ where: { action: 'STATUS_CHANGED' } });
    if (!action) throw new Error("Action type 'STATUS_CHANGED' not found");

    await changeHistoryService.logChange({
      userId: data.userId,
      taskId: taskId,
      actionId: action.id,
      description: `Estado cambiado a "${data.status}" por el usuario ${data.userId}`,
    });

    return updatedTask;
  },


  changePriority: async (taskId: number, priority: PriorityType, userId: number) => {
    const updatedTask = await tasksRepository.changePriority(taskId, priority);

    const action = await prisma.action.findUnique({ where: { action: 'UPDATED' } });
    if (!action) throw new Error("Action type 'UPDATED' not found");

    await changeHistoryService.logChange({
      userId,
      taskId: taskId,
      actionId: action.id,
      description: `Prioridad cambiada a "${priority}"`,
    });

    return updatedTask;
  },
};
