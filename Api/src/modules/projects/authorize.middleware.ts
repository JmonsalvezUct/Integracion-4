
import express, { type Request, type Response, type NextFunction } from "express";

import { prisma } from "../../app/loaders/prisma.js";


export type Role = "owner" | "admin" | "member";

export function authorizeProject(allowed: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {

    const userId: number | undefined =
      (req as any).user?.id ??
      (req.header("x-user-id") ? Number(req.header("x-user-id")) : undefined) ??
      (req.body?.creatorId ? Number(req.body.creatorId) : undefined);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let projectId: number | undefined;


    const p: any = req.params || {};
    const candidate = p.projectId ?? p.id ?? p.project ?? undefined;
    if (candidate !== undefined) projectId = Number(candidate);

    
    if (!projectId && req.body?.projectId) projectId = Number(req.body.projectId);
    if (!projectId && (req.query as any)?.projectId) {
      projectId = Number((req.query as any).projectId);
    }

 
    if (!projectId && req.baseUrl.includes("/tasks") && p?.id) {
      const taskId = Number(p.id);
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { projectId: true },
      });
      projectId = task?.projectId;
    }

    if (!projectId) return res.status(400).json({ message: "projectId requerido" });

    const membership = await prisma.userProject.findFirst({
      where: { userId, projectId },
      select: { role: { select: { role: true } } },
    });

    const role = membership?.role.role as Role | undefined;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
