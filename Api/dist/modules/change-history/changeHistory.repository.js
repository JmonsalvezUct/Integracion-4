import { prisma } from "../../app/loaders/prisma.js";
import { ActionType } from "@prisma/client";
export const changeHistoryRepository = {
    createChange: (data) => {
        return prisma.changeHistory.create({ data });
    },
    getByTask: async (taskId) => {
        return prisma.changeHistory.findMany({
            where: { taskId },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    },
    getByProject: (projectId) => prisma.changeHistory.findMany({
        where: { projectId },
        include: { user: true },
        orderBy: { createdAt: "desc" },
    }),
};
//# sourceMappingURL=changeHistory.repository.js.map