import { z } from "zod";

export const createTask = {
  body: z.object({
    title: z.string().min(1),
    projectId: z.coerce.number().int().positive(),
    creatorId: z.coerce.number().int().positive().optional(),
    statusId: z.coerce.number().int().positive().optional(),
    priorityId: z.coerce.number().int().positive().default(1),
    description: z.string().optional(),
    dueDate: z.coerce.date().optional(),
  }),
};

export const listTasks = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
    projectId: z.coerce.number().int().positive().optional(),
    creatorId: z.coerce.number().int().positive().optional(),
    assigneeId: z.coerce.number().int().positive().optional(),
    statusId: z.coerce.number().int().positive().optional(),
    priorityId: z.coerce.number().int().positive().optional(),
    search: z.string().trim().min(1).optional(),
    dueFrom: z.coerce.date().optional(),
    dueTo: z.coerce.date().optional(),
    
    sort: z.enum(["createdAt","dueDate","priorityId","statusId","title","id"]).optional(),

    order: z.enum(["asc","desc"]).default("desc"),
  }),
};

export const getTaskById = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};
export const deleteTask = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};
export const updateTask = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),

    
    projectId:  z.coerce.number().int().positive().optional(),
    statusId:   z.coerce.number().int().positive().optional(),
    priorityId: z.coerce.number().int().positive().optional(),
    assigneeId: z.coerce.number().int().positive().nullable().optional(), 
  }).refine(obj => Object.keys(obj).length > 0, {
    message: "Body vacío: envía al menos un campo para actualizar",
  }),
};