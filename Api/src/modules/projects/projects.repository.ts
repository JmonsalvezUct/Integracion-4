import { prisma } from '../../app/loaders/prisma.js';
import type { CreateProjectDTO, UpdateProjectDTO } from './projects.validators.js';

export const projectsRepository = {
  createProject: (data: CreateProjectDTO) => prisma.project.create({ data }),
  getProjects: () => prisma.project.findMany(),
  getProjectById: (id: number) => prisma.project.findUnique({ where: { id } }),
  updateProject: (id: number, data: UpdateProjectDTO) => prisma.project.update({ where: { id }, data }),
  deleteProject: (id: number) => prisma.project.delete({ where: { id } }),

  getProjectsByUserId: (userId: number) =>
    prisma.userProject.findMany({
      where: { userId },
      include: {
        project: true,
        role: true,
      },
    }),

  getUserRolesInProjects: (userId: number) =>
    prisma.userProject.findMany({
      where: { userId },
      select: {
        projectId: true,
        role: true,
      },
    }),
};
