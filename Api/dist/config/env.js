import { z } from 'zod';
const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
});
export const env = EnvSchema.parse(process.env);
//# sourceMappingURL=env.js.map