    import { prisma } from '../../app/loaders/prisma.js';
    export const projectsRepository = {
        createProject: (data, userId) => prisma.project.create({
            data: {
                ...data,
                users: {
                    create: {
                        userId,
                        role: 'admin'
                    }
                }
            },
            include: {
                users: true
            }
        }),
        getProjects: () => prisma.project.findMany(),
        getProjectById: async (id) => {
            if (!id || isNaN(id)) {
            console.error("getProjectById: ID inválido o ausente:", id);
            throw new Error("ID inválido o ausente");
            }

            return prisma.project.findUnique({
            where: { id: Number(id) },
            include: {
                users: {
                include: { user: true },
                },
                tasks: true,
            },
            });
        },
        updateProject: (id, data) => prisma.project.update({ where: { id }, data }),
        deleteProject: (id) => prisma.project.delete({ where: { id } }),
        getProjectsByUserId: (userId) => prisma.userProject.findMany({
            where: { userId },
            include: {
                project: true,
                user: true,
            },
        }),
        addUserToProject: (projectId, userId, role) => prisma.userProject.create({ data: { projectId, userId, role } }),
        updateUserRoleInProject: (userProjectId, role) => prisma.userProject.update({ where: { id: userProjectId }, data: { role } }),
        removeUserFromProject: (userProjectId) => prisma.userProject.delete({ where: { id: userProjectId } }),
        getProjectMembers: async (projectId) => {
            if (!projectId || isNaN(projectId)) {
            console.error(" getProjectMembers: projectId inválido o ausente:", projectId);
            throw new Error("projectId inválido o ausente");
            }

            return prisma.userProject.findMany({
            where: { projectId: Number(projectId) },
            include: { user: true },
            });
        },
        getProjectMemberByUserId: (projectId, userId) => prisma.userProject.findFirst({
            where: { projectId, userId },
        }),
        patchProject: (id, data) => prisma.project.update({
            where: { id },
            data
        }),
    };
    //# sourceMappingURL=projects.repository.js.map