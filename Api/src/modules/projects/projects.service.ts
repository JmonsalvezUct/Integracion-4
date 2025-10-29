import type { ProjectRoleType } from '@prisma/client';
import { projectsRepository } from './projects.repository.js';
import type { CreateProjectDTO, UpdateProjectDTO } from './projects.validators.js';

export const projectsService = {
  async createProject(data: CreateProjectDTO, userId: number) {
    return projectsRepository.createProject(data, userId);
  },
  async getProjects() {
    return projectsRepository.getProjects();
  },
  async getProjectById(projectId: number) {
    return projectsRepository.getProjectById(projectId);
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

  async addUserToProject(projectId: number, userId: number, role: ProjectRoleType) {
    return projectsRepository.addUserToProject(projectId, userId, role);
  },

  async updateUserRoleInProject(userProjectId: number, role: ProjectRoleType) {
    return projectsRepository.updateUserRoleInProject(userProjectId, role);
  },

  async removeUserFromProject(userProjectId: number) {
    return projectsRepository.removeUserFromProject(userProjectId);
  },

  async getProjectMembers(projectId: number) {
    return projectsRepository.getProjectMembers(projectId);
  },

  async patchProject(id: number, data: Partial<UpdateProjectDTO>) {
    return projectsRepository.patchProject(id, data);
  },
};