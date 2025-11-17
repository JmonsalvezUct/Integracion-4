import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { membersService } from "./members.service.js";

export const getMembers = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const members = await membersService.getMembers(projectId);
    return res.json(members);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener miembros" });
  }
};

export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.params.userId);
    const requesterId = Number(req.user?.id);

    if (!requesterId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const { role } = req.body;

    const updated = await membersService.updateRole(projectId, userId, role, requesterId);
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.params.userId);
    const requesterId = Number(req.user?.id);  

    if (!requesterId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    await membersService.remove(projectId, userId, requesterId);
    return res.json({ message: "Miembro eliminado" });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

