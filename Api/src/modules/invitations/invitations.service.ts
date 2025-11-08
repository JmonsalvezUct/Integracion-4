import crypto from "crypto";
import { invitationsRepository as repo } from "./invitations.repository.js";
import type { CreateInvitationDTO } from "./invitations.validators.js";
import { prisma } from "../../app/loaders/prisma.js";

export const invitationsService = {
  async create(projectId: number, dto: CreateInvitationDTO, requesterId: number) {
    const isAdmin = await repo.findProjectAdminMembership(projectId, requesterId);
    if (!isAdmin) throw new Error("No autorizado: requiere rol admin del proyecto.");

    const existing = await repo.findExistingPending(projectId, dto.email);
    if (existing) throw new Error("Ya existe una invitación pendiente para este email.");

    const maybeUser = await repo.findUserByEmail(dto.email);
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); 

    const invitation = await repo.createInvitation({
      email: dto.email,
      invitedUserId: maybeUser?.id ?? null,
      invitedById: requesterId,
      projectId,
      role: dto.role,
      token,
      expiresAt,
    });


    if (maybeUser) {
      await repo.notify(maybeUser.id, `Has sido invitado al proyecto #${projectId}.`);
    }

    return invitation;
  },

  async listForProject(projectId: number, status?: string) {
    return repo.listByProject(projectId, status);
  },

  async listForMe(userId: number, email: string | undefined) {
    if (!email) {
      throw new Error("Email requerido");
    }

    return repo.listForUser(userId, email);
  }
  ,

  async accept(invitationId: number, currentUser: { id: number; email: string }) {
    return await prisma.$transaction(async (tx) => {
      const inv = await tx.invitation.findUnique({ where: { id: invitationId } });
      if (!inv) throw new Error("Invitación no encontrada.");
      if (inv.status !== "PENDING") throw new Error("Invitación no está pendiente.");

      if (inv.email !== currentUser.email && inv.invitedUserId !== currentUser.id) {
        throw new Error("No autorizado para esta invitación.");
      }


      const existing = await tx.userProject.findFirst({
        where: { userId: currentUser.id, projectId: inv.projectId },
      });
      if (!existing) {
        await tx.userProject.create({
          data: { userId: currentUser.id, projectId: inv.projectId, role: inv.role }
        });
      }

      await tx.invitation.update({ where: { id: inv.id }, data: { status: "ACCEPTED", invitedUserId: currentUser.id } });

      await tx.changeHistory.create({
        data: {
          userId: currentUser.id,
          projectId: inv.projectId,
          description: `Usuario aceptó invitación y se unió al proyecto como ${inv.role}.`,
          action: "ASSIGNED",
        }
      });

      return { ok: true };
    });
  },

  async reject(invitationId: number, currentUser: { id: number; email: string }) {
    const inv = await repo.getById(invitationId);
    if (!inv) throw new Error("Invitación no encontrada.");
    if (inv.status !== "PENDING") throw new Error("Invitación no está pendiente.");

    if (inv.email !== currentUser.email && inv.invitedUserId !== currentUser.id) {
        throw new Error("No autorizado para esta invitación.");
        }
        await repo.markStatus(invitationId, "REJECTED");
        return { ok: true };
    },
};
