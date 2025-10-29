import { sprintsRepository } from "./sprints.repository.js";
import type { CreateSprintDTO, UpdateSprintDTO } from "./sprints.validators.js";

export const sprintsService = {
  async createSprint(projectId: number, data: CreateSprintDTO) {
    return await sprintsRepository.createSprint(projectId, data);
  },

  async getSprintsByProjectId(projectId: number) {
    return await sprintsRepository.getSprintsByProjectId(projectId);
  },

  async getSprintById(sprintId: number) {
    return await sprintsRepository.getSprintById(sprintId);
  },

  async updateSprint(sprintId: number, data: UpdateSprintDTO) {
    return await sprintsRepository.updateSprint(sprintId, data);
  },

  async deleteSprint(sprintId: number) {
    return await sprintsRepository.deleteSprint(sprintId);
  },

  async finalizeSprint(sprintId: number) {
    return await sprintsRepository.updateSprint(sprintId, { isActive: false });
  },
};
