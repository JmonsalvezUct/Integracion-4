import { sprintsRepository } from "./sprints.repository.js";
export const sprintsService = {
    async createSprint(projectId, data) {
        return await sprintsRepository.createSprint(projectId, data);
    },
    async getSprintsByProjectId(projectId) {
        return await sprintsRepository.getSprintsByProjectId(projectId);
    },
    async getSprintById(sprintId) {
        return await sprintsRepository.getSprintById(sprintId);
    },
    async updateSprint(sprintId, data) {
        return await sprintsRepository.updateSprint(sprintId, data);
    },
    async deleteSprint(sprintId) {
        return await sprintsRepository.deleteSprint(sprintId);
    },
    async finalizeSprint(sprintId) {
        return await sprintsRepository.updateSprint(sprintId, { isActive: false });
    },
};
//# sourceMappingURL=sprints.service.js.map