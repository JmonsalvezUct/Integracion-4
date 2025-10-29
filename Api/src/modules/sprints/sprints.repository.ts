import { prisma } from "../../app/loaders/prisma.js";
import type { CreateSprintDTO, UpdateSprintDTO } from "./sprints.validators.js";

export const sprintsRepository = {
  createSprint: (projectId: number, data: CreateSprintDTO) =>
    prisma.sprint.create({
      data: { ...data, projectId },
    }),

  getSprintsByProjectId: (projectId: number) =>
    prisma.sprint.findMany({ 
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

  getSprintById: (id: number) =>
    prisma.sprint.findUnique({
      where: { id },
      include: {
        project: true,
        tasks: true,
      },
    }),

  updateSprint: (id: number, data: Partial<UpdateSprintDTO>) =>
    prisma.sprint.update({
      where: { id },
      data,
    }),

  deleteSprint: (id: number) =>
    prisma.sprint.delete({
      where: { id },
    }),
};
