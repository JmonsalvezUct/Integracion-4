import { tasksRepository } from './tasks.repository.js';
import type {
  CreateTaskDTO,
  UpdateTaskDTO,
  AssignTaskDTO,
  ChangeStatusDTO,
} from './tasks.validators.js';
import type { StatusType, PriorityType } from '@prisma/client';

export const tasksService = {
  createTask: async (data: CreateTaskDTO) => {
    return tasksRepository.createTask(data);
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

  changePriority: async (id: number, priority: PriorityType) => {
    return tasksRepository.changePriority(id, priority);
  },
};
