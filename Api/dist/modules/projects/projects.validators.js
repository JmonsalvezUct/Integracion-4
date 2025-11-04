import { z } from 'zod';
export const CreateProjectSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(255).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.string().optional(),
});
export const UpdateProjectSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(255).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.string().optional(),
});
//# sourceMappingURL=projects.validators.js.map