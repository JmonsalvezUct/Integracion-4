    import { changeHistoryRepository } from "./changeHistory.repository.js";

    export const changeHistoryService = {
    // 🟢 Registrar un cambio
    async logChange(params: {
        userId: number;
        description: string;
        actionId: number;
        taskId?: number | null;
        projectId?: number | null;
    }) {
        return changeHistoryRepository.createChange(params);
    },

    // 🟣 Obtener historial por tarea
    async getHistoryByTask(taskId: number) {
        return changeHistoryRepository.getByTask(taskId);
    },

    // 🟠 Obtener historial por proyecto
    async getHistoryByProject(projectId: number) {
        return changeHistoryRepository.getByProject(projectId);
    },
    };
