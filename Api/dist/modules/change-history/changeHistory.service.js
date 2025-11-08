import { changeHistoryRepository } from "./changeHistory.repository.js";
import { ActionType } from "@prisma/client";
export const changeHistoryService = {
    async logChange(params) {
        try {
            const data = {
                userId: Number(params.userId),
                description: params.description,
                action: params.action,
                taskId: params.taskId ? Number(params.taskId) : null,
                projectId: params.projectId ? Number(params.projectId) : null,
            };
            const record = await changeHistoryRepository.createChange(data);
            console.log("📝 Historial registrado:", data);
            return record;
        }
        catch (error) {
            console.error("❌ Error al registrar en ChangeHistory:", error);
            throw error;
        }
    },
    async getHistoryByTask(taskId) {
        return changeHistoryRepository.getByTask(Number(taskId));
    },
    async getHistoryByProject(projectId) {
        return changeHistoryRepository.getByProject(Number(projectId));
    },
};
//# sourceMappingURL=changeHistory.service.js.map