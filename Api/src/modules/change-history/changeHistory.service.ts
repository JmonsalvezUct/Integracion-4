    import { changeHistoryRepository } from "./changeHistory.repository.js";
    import { ActionType } from "@prisma/client"; 
    export const changeHistoryService = {

    async logChange(params: {
        userId: number;
        description: string;
        action: ActionType;
        taskId?: number | null;
        projectId?: number | null;
    }) {
        return changeHistoryRepository.createChange(params);
    },


    async getHistoryByTask(taskId: number) {
        return changeHistoryRepository.getByTask(taskId);
    },


    async getHistoryByProject(projectId: number) {
        return changeHistoryRepository.getByProject(projectId);
    },
    };
