import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";  
import { invitationsService } from "./invitations.service.js";
import { CreateInvitationDTO } from "./invitations.validators.js";

/**
 * Crear invitación a un proyecto
 */
export const createInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const dto = CreateInvitationDTO.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const userId = req.user.id;

    const inv = await invitationsService.create(projectId, dto, userId);
    res.status(201).json(inv);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};


/**
 * Listar invitaciones de un proyecto (solo admin)
 */
export const listProjectInvitations = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const { status } = req.query as { status?: string };

    const list = await invitationsService.listForProject(projectId, status);
    res.json(list);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};


/**
 * Listar invitaciones asignadas al usuario logueado
 */
export const listMyInvitations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const me = req.user;
    const list = await invitationsService.listForMe(me.id, me.email!);



    res.json(list);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};


/**
 * Aceptar invitación
 */
export const acceptInvitation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const id = Number(req.params.id);

    await invitationsService.accept(id, {
      id: req.user.id,
      email: req.user.email!,
    });


    res.json({ message: "Invitación aceptada" });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};


/**
 * Rechazar invitación
 */
export const rejectInvitation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const id = Number(req.params.id);

    await invitationsService.reject(id, {
    id: req.user.id,
    email: req.user.email!,
  });


    res.json({ message: "Invitación rechazada" });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
