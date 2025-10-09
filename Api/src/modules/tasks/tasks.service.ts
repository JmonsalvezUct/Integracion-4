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

  updateTask: async (id: number, data: UpdateTaskDTO) => {
    return tasksRepository.updateTask(id, data);
  },

  deleteTask: async (id: number) => {
    return tasksRepository.deleteTask(id);
  },

  getTasksByProject: async (projectId: number) => {
    return tasksRepository.getTasksByProject(projectId);
  },

  assignTask: async (id: number, data: AssignTaskDTO) => {
    return tasksRepository.assignTask(id, data.assigneeId);
  },

  changeStatus: async (id: number, data: ChangeStatusDTO) => {
    return tasksRepository.changeStatus(id, data.status as StatusType);
  },

  changePriority: async (id: number, priority: PriorityType) => {
    return tasksRepository.changePriority(id, priority);
  },
};
