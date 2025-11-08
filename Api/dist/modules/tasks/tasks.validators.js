import { z } from 'zod';
import { StatusType, PriorityType } from "@prisma/client";
export const CreateTaskSchema = z.object({
    title: z.string().min(2, "El título es obligatorio").max(100),
    description: z.string().max(255).optional(),
    dueDate: z.coerce.date().optional(),
    projectId: z.number(), // viene del parámetro de ruta
    assigneeId: z.number().optional(),
    status: z.nativeEnum(StatusType).optional(),
    priority: z.nativeEnum(PriorityType).optional(),
});
export const UpdateTaskSchema = z.object({
    title: z.string().min(2).max(100).optional(),
    description: z.string().max(255).optional(),
    dueDate: z.coerce.date().optional(),
    assigneeId: z.number().optional(),
    status: z.nativeEnum(StatusType).optional(),
    priority: z.nativeEnum(PriorityType).optional(),
});
export const AssignTaskSchema = z.object({
    assigneeId: z.number().int(),
});
export const ChangeStatusSchema = z.object({
    status: z.string(),
});
//# sourceMappingURL=tasks.validators.js.map