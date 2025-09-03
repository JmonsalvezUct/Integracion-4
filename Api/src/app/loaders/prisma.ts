import { PrismaClient } from '@prisma/client';

declare global {
  var __PRISMA__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__PRISMA__ ??
  new PrismaClient({
    log: ['warn', 'error'], // agrega 'query' si necesitas debug
  });

if (process.env.NODE_ENV !== 'production') global.__PRISMA__ = prisma;
