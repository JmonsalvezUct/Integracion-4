    import { prisma } from "../../app/loaders/prisma.js";

    export const changeHistoryRepository = {
    createChange: (data: {
        userId: number;
        description: string;
        actionId: number;
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
            action: true,
        },
        orderBy: { createdAt: "desc" },
        });
    },

        getByProject: (projectId: number) =>
        prisma.changeHistory.findMany({
        where: { projectId },
        include: { user: true, action: true },
        orderBy: { createdAt: "desc" },
        }),
    };
