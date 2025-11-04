import { PrismaClient } from '@prisma/client';
export const prisma = global.__PRISMA__ ??
    new PrismaClient({
        log: ['warn', 'error'],
    });
if (process.env.NODE_ENV !== 'production')
    global.__PRISMA__ = prisma;
//# sourceMappingURL=prisma.js.map