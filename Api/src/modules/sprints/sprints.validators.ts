import { z } from "zod";

export const createSprintSchema = z.object({
  name: z.string().min(3, "El nombre del sprint es obligatorio"),
  description: z.string().optional(),
  startDate: z.string().transform((d) => new Date(d)),
  endDate: z.string().transform((d) => new Date(d)),
});

export const updateSprintSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional().transform((d) => (d ? new Date(d) : undefined)),
  endDate: z.string().optional().transform((d) => (d ? new Date(d) : undefined)),

  isActive: z.boolean().optional(),
});

export type CreateSprintDTO = z.infer<typeof createSprintSchema>;
export type UpdateSprintDTO = z.infer<typeof updateSprintSchema>;
