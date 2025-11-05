import { prisma } from "../../app/loaders/prisma.js";
import type { ProjectRoleType } from "@prisma/client";

export const invitationsRepository = {
  findUserByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  findProjectAdminMembership: (projectId: number, userId: number) =>
    prisma.userProject.findFirst({ where: { projectId, userId, role: "admin" } }),

  findExistingPending: (projectId: number, email: string) =>
    prisma.invitation.findFirst({
      where: { projectId, email, status: "PENDING" }
    }),

  createInvitation: (data: {
    email: string;
    invitedUserId?: number | null;
    invitedById: number;
    projectId: number;
    role: ProjectRoleType;
    token: string;
    expiresAt?: Date | null;
  }) => prisma.invitation.create({ data }),

  getById: (id: number) =>
    prisma.invitation.findUnique({ where: { id } }),

  listByProject: (projectId: number, status?: string) =>
    prisma.invitation.findMany({
      where: { projectId, ...(status ? { status: status as any } : {}) },
      orderBy: { createdAt: "desc" }
    }),

  listForUser: (userId: number, email: string) =>
    prisma.invitation.findMany({
      where: { OR: [{ invitedUserId: userId }, { email }] },
      orderBy: { createdAt: "desc" }
    }),

  markStatus: (id: number, status: "ACCEPTED"|"REJECTED"|"EXPIRED") =>
    prisma.invitation.update({ where: { id }, data: { status } }),

  ensureMembership: (projectId: number, userId: number, role: ProjectRoleType) =>
    prisma.userProject.upsert({
      where: { 

        // @ts-ignore: 
        userId_projectId: { userId, projectId }
      },
      update: { role },
      create: { userId, projectId, role }
    }),

    createHistory: (data: {
    userId: number; projectId: number; description: string;
    }) => prisma.changeHistory.create({
    data: { userId: data.userId, projectId: data.projectId, description: data.description, action: "ASSIGNED" }
    }),

notify: async (userId: number, message: string) => {
  const notifType = await prisma.notificationType.upsert({
    where: { type: "INVITATION" },
    update: {},
    create: { type: "INVITATION" },
  });

  return prisma.notification.create({
    data: {
      userId,
      message,
      typeId: notifType.id,
    },
  });
},

};
