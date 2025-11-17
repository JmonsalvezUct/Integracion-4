
import { prisma } from "../../app/loaders/prisma.js";
import { ProjectRoleType } from "@prisma/client";



export const membersService = {
  async getMembers(projectId: number) {
    return prisma.userProject.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });
  },

  async updateRole(projectId: number, userId: number, role: string, requesterId: number) {
    const validRoles = ["admin", "developer", "guest"];

    if (!validRoles.includes(role)) {
      throw new Error("Rol inválido");
    }

    const requester = await prisma.userProject.findFirst({
      where: { projectId, userId: requesterId },
    });

    if (!requester || requester.role !== "admin") {
      throw new Error("No autorizado");
    }

    const target = await prisma.userProject.findFirst({
      where: { projectId, userId },
    });

    if (!target) throw new Error("Miembro no encontrado");

    if (target.role === "admin" && requesterId !== userId) {
      throw new Error("No puedes modificar a otro admin");
    }

    return prisma.userProject.update({
      where: { id: target.id },
      data: { role: role as ProjectRoleType }

    });
  },

  async remove(projectId: number, userId: number, requesterId: number) {

    const requester = await prisma.userProject.findFirst({
      where: { projectId, userId: requesterId },
    });


    if (!requester || requester.role !== "admin") {
      throw new Error("No autorizado");
    }

    const target = await prisma.userProject.findFirst({
      where: { projectId, userId },
    });


    if (!target) throw new Error("Miembro no encontrado");

    if (target.role === "admin" && requesterId !== userId) {
      throw new Error("No puedes eliminar a otro admin");
    }

    await prisma.userProject.delete({
      where: { id: target.id },
    });
  }

};
