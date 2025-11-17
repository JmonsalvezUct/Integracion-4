import { PrismaClient } from "@prisma/client";
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";

const prisma = new PrismaClient();

export function projectRoleMiddleware(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const projectId =
        Number(req.params.projectId) ||
        Number(req.params.id) ||
        Number(req.body.projectId);

      if (!projectId) {
        return res.status(400).json({ error: "projectId no proporcionado" });
      }

      // Buscar si el usuario pertenece al proyecto
      const membership = await prisma.userProject.findFirst({
        where: { userId, projectId },
      });

      if (!membership) {
        return res.status(403).json({ error: "No eres miembro del proyecto" });
      }

      // Validar rol
      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ error: "Acceso denegado: rol insuficiente" });
      }

      next();
    } catch (error) {
      console.error("Error en projectRoleMiddleware:", error);
      return res
        .status(500)
        .json({ error: "Error verificando roles del proyecto" });
    }
  };
}
