import { z } from "zod";

export const getProjectTasks = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),

    search: z.string().trim().min(1).optional(),
    assigneeId: z.coerce.number().int().positive().optional(),
    statusId:   z.coerce.number().int().positive().optional(),
    priorityId: z.coerce.number().int().positive().optional(),
    dueFrom: z.coerce.date().optional(),
    dueTo:   z.coerce.date().optional(),

    sort:  z.enum(["createdAt","dueDate","priorityId","statusId","title","id"]).optional(),
    order: z.enum(["asc","desc"]).default("desc"),
  }),
};

export const cloneProjectSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z
    .object({
      name: z.string().min(1).max(120).optional(),
      copyMembers: z.boolean().optional().default(false),
      copyAttachments: z.boolean().optional().default(false),
    })
    .optional(),
};