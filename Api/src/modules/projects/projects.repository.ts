import { prisma } from '../../app/loaders/prisma.js';
import type { CreateProjectDTO, UpdateProjectDTO } from './projects.validators.js';
import type { ProjectRoleType } from '@prisma/client';

export const projectsRepository = {
  createProject: (data: CreateProjectDTO, userId: number) => prisma.project.create({
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
  getProjectById: (id: number) => prisma.project.findUnique({ where: { id } }),
  updateProject: (id: number, data: UpdateProjectDTO) => prisma.project.update({ where: { id }, data }),
  deleteProject: (id: number) => prisma.project.delete({ where: { id } }),

  getProjectsByUserId: (userId: number) =>
    prisma.userProject.findMany({
      where: { userId },
      include: {
        project: true,
        user: true,
      },
    }),

  addUserToProject: (projectId: number, userId: number, role: ProjectRoleType) =>
    prisma.userProject.create({ data: { projectId, userId, role } }),

  updateUserRoleInProject: (userProjectId: number, role: ProjectRoleType) =>
    prisma.userProject.update({ where: { id: userProjectId }, data: { role } }),

  removeUserFromProject: (userProjectId: number) =>
    prisma.userProject.delete({ where: { id: userProjectId } }),

  getProjectMembers: (projectId: number) =>
    prisma.userProject.findMany({
      where: { projectId: projectId },
      include: {
        user: true,
      },
    }),

  getProjectMemberByUserId: (projectId: number, userId: number) =>
    prisma.userProject.findFirst({
      where: { projectId, userId },
    }),
    
  patchProject: (id: number, data: Partial<UpdateProjectDTO>) => 
    prisma.project.update({
      where: { id },
      data
    }),
};
