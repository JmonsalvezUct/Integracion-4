import { prisma } from '../../app/loaders/prisma.js';
export const tasksRepository = {
    createTask: (data) => prisma.task.create({
        data,
        include: {
            project: true,
            assignee: true,
            creator: true,
            tags: { include: { tag: true } },
        },
    }),
    getTasks: () => prisma.task.findMany({
        include: {
            assignee: true,
            creator: true,
            project: true,
            attachments: true,
            tags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
    }),
    getTaskById: (taskId) => prisma.task.findUnique({
        where: { id: taskId },
        include: {
            assignee: true,
            creator: true,
            project: true,
            attachments: true,
            tags: { include: { tag: true } },
        },
    }),
    updateTask: (id, data) => prisma.task.update({
        where: { id },
        data,
        include: {
            project: true,
            assignee: true,
            creator: true,
            tags: { include: { tag: true } },
        },
    }),
    deleteTask: (id) => prisma.task.delete({
        where: { id },
    }),
    getTasksByProject: (projectId) => prisma.task.findMany({
        where: { projectId },
        include: {
            assignee: true,
            creator: true,
            project: true,
            attachments: true,
            tags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
    }),
    assignTask: (id, assigneeId) => prisma.task.update({
        where: { id },
        data: { assigneeId },
    }),
    changeStatus: (id, status) => prisma.task.update({
        where: { id },
        data: { status },
    }),
    changePriority: (id, priority) => prisma.task.update({
        where: { id },
        data: { priority },
    }),
};
//# sourceMappingURL=tasks.repository.js.map