import { prisma } from "../../app/loaders/prisma.js";
export const tagsService = {
    async createTag(projectId, name, color) {
        return prisma.tag.create({
            data: { name, color, projectId },
        });
    },
    async getTagsByProject(projectId) {
        return prisma.tag.findMany({
            where: { projectId },
            orderBy: { name: "asc" },
        });
    },
    async assignTagToTask(taskId, tagId) {
        return prisma.taskTag.create({
            data: { taskId, tagId },
        });
    },
    async removeTagFromTask(taskId, tagId) {
        return prisma.taskTag.delete({
            where: { taskId_tagId: { taskId, tagId } },
        });
    },
    async getTagsByTask(taskId) {
        return prisma.taskTag.findMany({
            where: { taskId },
            include: { tag: true },
        });
    },
};
//# sourceMappingURL=tags.service.js.map