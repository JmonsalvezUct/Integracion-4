import { projectsRepository } from './projects.repository.js';
import type { CreateProjectDTO, UpdateProjectDTO } from './projects.validators.js';

export const projectsService = {
  async createProject(data: CreateProjectDTO) {
    return projectsRepository.createProject(data);
  },
  async getProjects() {
    return projectsRepository.getProjects();
  },
  async getProjectById(id: number) {
    return projectsRepository.getProjectById(id);
  },
  async updateProject(id: number, data: UpdateProjectDTO) {
    return projectsRepository.updateProject(id, data);
  },
  async deleteProject(id: number) {
    return projectsRepository.deleteProject(id);
  },
  async getProjectsByUserId(userId: number) {
    return projectsRepository.getProjectsByUserId(userId);
  },

  async getUserRolesInProjects(userId: number) {
    return projectsRepository.getUserRolesInProjects(userId);
  },
};