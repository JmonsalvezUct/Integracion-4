

import type { Request, Response } from "express";
import { prisma } from "../../app/loaders/prisma.js";
import type { Prisma } from "@prisma/client";
import { projectService } from "./projects.service.js";

/**
 * GET /projects/:id/tasks
 */
export const getProjectTasks = async (req: Request, res: Response) => {
  const { id } = ((req as any).validatedParams ?? req.params) as any;
  const q = ((req as any).validatedQuery ?? req.query) as any;

  const page = Number(q.page ?? 1);
  const pageSize = Math.min(100, Number(q.pageSize ?? 10));
  const toNum = (v: any) =>
    v === undefined || v === null || v === "" ? undefined : Number(v);

  const assigneeId = toNum(q.assigneeId);
  const statusId = toNum(q.statusId);
  const priorityId = toNum(q.priorityId);

  const dueFrom = q.dueFrom ? new Date(q.dueFrom) : undefined;
  const dueTo = q.dueTo ? new Date(q.dueTo) : undefined;
  const search =
    typeof q.search === "string" && q.search.trim() ? q.search.trim() : undefined;

  const skip = Math.max(0, (page - 1) * pageSize);
  const take = Math.max(1, pageSize);

  const where: Prisma.TaskWhereInput = { projectId: Number(id) };
  if (assigneeId !== undefined) where.assigneeId = assigneeId;
  if (statusId !== undefined) where.statusId = statusId;
  if (priorityId !== undefined) where.priorityId = priorityId;
  if (dueFrom || dueTo) where.dueDate = { gte: dueFrom, lte: dueTo };
  if (search)
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];

  const orderStr: Prisma.SortOrder = q.order === "asc" ? "asc" : "desc";
  let orderBy: Prisma.TaskOrderByWithRelationInput = { createdAt: orderStr };
  switch (q.sort) {
    case "createdAt":
      orderBy = { createdAt: orderStr };
      break;
    case "dueDate":
      orderBy = { dueDate: orderStr };
      break;
    case "priorityId":
      orderBy = { priorityId: orderStr };
      break;
    case "statusId":
      orderBy = { statusId: orderStr };
      break;
    case "title":
      orderBy = { title: orderStr };
      break;
    case "id":
      orderBy = { id: orderStr };
      break;
  }

  const [total, items] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({ where, orderBy, skip, take }),
  ]);

  res.json({
    items,
    pageInfo: {
      page,
      pageSize: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
};

export const projectController = {
  // TDI-79: Crear proyecto
  createProject: async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ error: "El nombre del proyecto es requerido" });
      }

      const project = await projectService.createProject({ name, description });
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: "Error al crear el proyecto" });
    }
  },

  // TDI-80: Obtener todos los proyectos
  getAllProjects: async (_req: Request, res: Response) => {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los proyectos" });
    }
  },

  // TDI-81: Obtener proyecto por ID
  getProjectById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "ID debe ser un número válido" });
      }

      const project = await projectService.getProjectById(id);
      if (!project) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el proyecto" });
    }
  },

  // TDI-82: Actualizar proyecto
  updateProject: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "ID debe ser un número válido" });
      }

      const { name, description } = req.body;
      const project = await projectService.updateProject(id, {
        name,
        description,
      });

      if (!project) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el proyecto" });
    }
  },

  // TDI-83: Eliminar proyecto
  deleteProject: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "ID debe ser un número válido" });
      }

      const deleted = await projectService.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar el proyecto" });
    }
  },
};
