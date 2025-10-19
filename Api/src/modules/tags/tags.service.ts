    import { prisma } from "../../app/loaders/prisma.js";

    export const tagsService = {
    async createTag(projectId: number, name: string, color?: string) {
        return prisma.tag.create({
        data: { name, color, projectId },
        });
    },

    async getTagsByProject(projectId: number) {
        return prisma.tag.findMany({
        where: { projectId },
        orderBy: { name: "asc" },
        });
    },

    async assignTagToTask(taskId: number, tagId: number) {
        return prisma.taskTag.create({
        data: { taskId, tagId },
        });
    },

    async removeTagFromTask(taskId: number, tagId: number) {
        return prisma.taskTag.delete({
        where: { taskId_tagId: { taskId, tagId } },
        });
    },

    async getTagsByTask(taskId: number) {
        return prisma.taskTag.findMany({
        where: { taskId },
        include: { tag: true },
        });
    },
    };
