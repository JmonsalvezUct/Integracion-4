import { z } from 'zod';
export const RegisterSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(72),
    profilePicture: z.string().url().optional(),
});
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
});
export const RefreshSchema = z.object({
    refreshToken: z.string().min(20),
    userAgent: z.string().optional(),
});
//# sourceMappingURL=auth.validators.js.map