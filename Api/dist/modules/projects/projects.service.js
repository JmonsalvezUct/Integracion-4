import { projectsRepository } from './projects.repository.js';
export const projectsService = {
    async createProject(data, userId) {
        return projectsRepository.createProject(data, userId);
    },
    async getProjects() {
        return projectsRepository.getProjects();
    },
    async getProjectById(id) {
        return projectsRepository.getProjectById(id);
    },
    async updateProject(id, data) {
        return projectsRepository.updateProject(id, data);
    },
    async deleteProject(id) {
        return projectsRepository.deleteProject(id);
    },
    async getProjectsByUserId(userId) {
        return projectsRepository.getProjectsByUserId(userId);
    },
    async addUserToProject(projectId, userId, role) {
        return projectsRepository.addUserToProject(projectId, userId, role);
    },
    async updateUserRoleInProject(userProjectId, role) {
        return projectsRepository.updateUserRoleInProject(userProjectId, role);
    },
    async removeUserFromProject(userProjectId) {
        return projectsRepository.removeUserFromProject(userProjectId);
    },
    async getProjectMembers(projectId) {
        return projectsRepository.getProjectMembers(projectId);
    },
    async patchProject(id, data) {
        return projectsRepository.patchProject(id, data);
    },
};
//# sourceMappingURL=projects.service.js.map