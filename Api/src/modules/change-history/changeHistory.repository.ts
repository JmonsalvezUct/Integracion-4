    import { prisma } from "../../app/loaders/prisma.js";
    import { ActionType } from "@prisma/client";
    export const changeHistoryRepository = {
    createChange: (data: {
        userId: number;
        description: string;
        action: ActionType;
        taskId?: number | null;
        projectId?: number | null;
    }) => {
        return prisma.changeHistory.create({ data });
    },

    getByTask: async (taskId: number) => {
        return prisma.changeHistory.findMany({
        where: { taskId },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        });
    },

        getByProject: (projectId: number) =>
        prisma.changeHistory.findMany({
        where: { projectId },
        include: { user: true},
        orderBy: { createdAt: "desc" },
        }),
    };
