import { tasksRepository } from './tasks.repository.js';
import { changeHistoryService } from '../change-history/changeHistory.service.js'; 


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



    await changeHistoryService.logChange({
      userId,
      taskId: task.id,
      action: ActionType.CREATED,
      description: `Tarea creada por el usuario ${userId}`,
    });

    return task;
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


  for (const field of Object.keys(taskData) as (keyof UpdateTaskDTO)[]) {
    const oldValue = oldTask[field];
    const newValue = taskData[field];

    const oldValStr = oldValue instanceof Date ? oldValue.toISOString() : String(oldValue ?? '');
    const newValStr = newValue instanceof Date ? newValue.toISOString() : String(newValue ?? '');


    if (oldValStr !== newValStr) {
  

      await changeHistoryService.logChange({
        userId,
        taskId: taskId,
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
    

    await changeHistoryService.logChange({ // se registra un cambio en el historial, taskid se pone en null porque ya no va a existir y se conserva projectid para que se sepa aque proyecto pertenecia
      userId,
      taskId: null, 
      projectId: task.projectId ?? null,
      action: ActionType.DELETED,
      description: `Tarea "${task.title}" (ID ${task.id}) eliminada por el usuario ${userId}`,
    });


    await tasksRepository.deleteTask(taskId); //se elimina la tarea
  },



  getTasksByProject: async (projectId: number) => {
    return tasksRepository.getTasksByProject(projectId);
  },


  assignTask: async (taskId: number, data: AssignTaskDTO & { userId: number }) => { // se toma el id de la tarea,, los datos, el id de el usuario al que se va a asignar la tarea, y el id del usuario que esta realizado la asignacion
    const updatedTask = await tasksRepository.assignTask(taskId, data.assigneeId);


    await changeHistoryService.logChange({ //registra la asignacion en el historial
      userId: data.userId,
      taskId: taskId,
      projectId: updatedTask.projectId,
      action: ActionType.ASSIGNED,
      description: `Tarea asignada al usuario ${data.assigneeId} por ${data.userId}`,
    });

    return updatedTask;
  },


  changeStatus: async (taskId: number, data: ChangeStatusDTO & { userId: number }) => {
    const updatedTask = await tasksRepository.changeStatus(taskId, data.status as StatusType);


    await changeHistoryService.logChange({
      userId: data.userId,
      taskId: taskId,
      projectId: updatedTask.projectId,
      action: ActionType.STATUS_CHANGED,
      description: `Estado cambiado a "${data.status}" por el usuario ${data.userId}`,
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
