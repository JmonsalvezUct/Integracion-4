import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export const getProjectTasks = async (req: Request, res: Response) => {
  const { id } = ((req as any).validatedParams ?? req.params) as any;
  const q      = ((req as any).validatedQuery  ?? req.query)  as any;

  const page     = Number(q.page ?? 1);
  const pageSize = Math.min(100, Number(q.pageSize ?? 10));
  const toNum = (v: any) => (v === undefined || v === null || v === "" ? undefined : Number(v));

  const assigneeId = toNum(q.assigneeId);
  const statusId   = toNum(q.statusId);
  const priorityId = toNum(q.priorityId);

  const dueFrom = q.dueFrom ? new Date(q.dueFrom) : undefined;
  const dueTo   = q.dueTo   ? new Date(q.dueTo)   : undefined;
  const search  = typeof q.search === "string" && q.search.trim() ? q.search.trim() : undefined;

  const skip = Math.max(0, (page - 1) * pageSize);
  const take = Math.max(1, pageSize);

  const where: any = { projectId: Number(id) };
  if (assigneeId !== undefined) where.assigneeId = assigneeId;
  if (statusId   !== undefined) where.statusId   = statusId;
  if (priorityId !== undefined) where.priorityId = priorityId;
  if (dueFrom || dueTo) where.dueDate = { gte: dueFrom, lte: dueTo };
  if (search) where.OR = [
    { title:       { contains: search, mode: "insensitive" } },
    { description: { contains: search, mode: "insensitive" } },
  ];

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
