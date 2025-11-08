import { prisma } from "../../app/loaders/prisma.js";
export const sprintsRepository = {
    createSprint: (projectId, data) => prisma.sprint.create({
        data: { ...data, projectId },
    }),
    getSprintsByProjectId: (projectId) => prisma.sprint.findMany({
        where: { projectId },
        include: {
            tasks: {
                include: {
                    assignee: true,
                    tags: { include: { tag: true } },
                },
            },
        },
        orderBy: { startDate: "asc" },
    }),
    getSprintById: (id) => prisma.sprint.findUnique({
        where: { id },
        include: {
            project: true,
            tasks: true,
        },
    }),
    updateSprint: (id, data) => prisma.sprint.update({
        where: { id },
        data,
    }),
    deleteSprint: (id) => prisma.sprint.delete({
        where: { id },
    }),
};
//# sourceMappingURL=sprints.repository.js.map