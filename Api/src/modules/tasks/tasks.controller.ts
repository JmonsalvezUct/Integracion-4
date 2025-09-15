import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import {prisma} from '../../app/loaders/prisma.js'

const DEFAULT_PRIORITY_ID = 1;
export const getTaskById = async (req: Request, res: Response) => {
  const { id } = ((req as any).validatedParams ?? req.params) as any;

  const task = await prisma.task.findUnique({
    where: { id: Number(id) },

  });

  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
};




export const updateTask = async (req: Request, res: Response) => {
  const { id }   = ((req as any).validatedParams ?? req.params) as any;
  const body:any =  (req as any).validatedBody   ?? req.body;

  const data: any = {};

  if ("title"       in body) data.title       = body.title;
  if ("description" in body) data.description = body.description; 
  if ("dueDate"     in body) data.dueDate     = body.dueDate ? new Date(body.dueDate) : null;

 
  if ("projectId"  in body) data.project  = { connect: { id: body.projectId } };
  if ("statusId"   in body) data.status   = { connect: { id: body.statusId } };
  if ("priorityId" in body) data.priority = { connect: { id: body.priorityId } };

  if ("assigneeId" in body) {
    data.assignee = body.assigneeId === null
      ? { disconnect: true }              
      : { connect: { id: body.assigneeId } };
  }

  try {
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data,
    });
    return res.json(task);
  } catch (e:any) {
    
    return res.status(400).json({
      message: "No se pudo actualizar la tarea",
      error: e?.message ?? String(e),
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = ((req as any).validatedParams ?? req.params) as any;

  try {
    await prisma.task.delete({ where: { id: Number(id) } });
    return res.status(204).send();
  } catch (e: any) {
    
    if (e?.code === "P2025") {
      return res.status(404).json({ message: "Task not found" });
    }
    
    if (e?.code === "P2003") {
      return res.status(409).json({ message: "No se pudo eliminar por dependencias" });
    }
    return res.status(500).json({ message: "Error al eliminar tarea", error: e?.message ?? String(e) });
  }
};

export const createTask = async (req: Request, res: Response) => {
  const { creatorId, projectId, statusId, priorityId, ...data } = req.body;
  const userPk: number | undefined = (req as any).user?.id ?? creatorId;
  if (!userPk)   return res.status(400).json({ message: "creatorId es requerido (temporalmente)" });
  if (!projectId) return res.status(400).json({ message: "projectId es requerido" });

  const createData: any = {
    ...data,
    creator:  { connect: { id: userPk } },
    project:  { connect: { id: projectId } },
    priority: { connect: { id: priorityId ?? DEFAULT_PRIORITY_ID } },
  };
  if (statusId) createData.status = { connect: { id: statusId } };

  const task = await prisma.task.create({ data: createData });
  res.status(201).json(task);
};


export const listTasks = async (req: Request, res: Response) => {
  
  const q = ((req as any).validatedQuery ?? req.query) as any;

  
  const page     = Number(q.page ?? 1);
  const pageSize = Math.min(100, Number(q.pageSize ?? 10));
  const toNum = (v: any) =>
    v === undefined || v === null || v === "" ? undefined : Number(v);

  const projectId  = toNum(q.projectId);
  const creatorId  = toNum(q.creatorId);
  const assigneeId = toNum(q.assigneeId);
  const statusId   = toNum(q.statusId);
  const priorityId = toNum(q.priorityId);

  const dueFrom = q.dueFrom ? new Date(q.dueFrom) : undefined;
  const dueTo   = q.dueTo   ? new Date(q.dueTo)   : undefined;
  const search  = typeof q.search === "string" && q.search.trim()
    ? q.search.trim()
    : undefined;

  const skip = Math.max(0, (page - 1) * pageSize);
  const take = Math.max(1, pageSize);

  const where: any = {};
  if (projectId !== undefined)  where.projectId  = projectId;
  if (creatorId !== undefined)  where.creatorId  = creatorId;
  if (assigneeId !== undefined) where.assigneeId = assigneeId;
  if (statusId !== undefined)   where.statusId   = statusId;
  if (priorityId !== undefined) where.priorityId = priorityId;
  if (dueFrom || dueTo) where.dueDate = { gte: dueFrom, lte: dueTo };
  if (search) {
    where.OR = [
      { title:       { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderStr: Prisma.SortOrder = q.order === "asc" ? "asc" : "desc";
  let orderBy: Prisma.TaskOrderByWithRelationInput = { createdAt: orderStr };
  switch (q.sort) {
    case "createdAt": orderBy = { createdAt: orderStr }; break;
    case "dueDate":   orderBy = { dueDate:   orderStr }; break;
    case "priorityId":orderBy = { priorityId:orderStr }; break;
    case "statusId":  orderBy = { statusId:  orderStr }; break;
    case "title":     orderBy = { title:     orderStr }; break;
    case "id":        orderBy = { id:        orderStr }; break;
  }

  const [total, items] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({ where, orderBy, skip, take }),
  ]);

  res.json({
    items,
    pageInfo: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
  });
};
