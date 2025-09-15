import { prisma } from '../../app/loaders/prisma.js';

export const healthService = {
  async check() {
    try {
      await prisma.$queryRaw`SELECT 1`; // test DB
      return {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date(),
        database: "connected",
      };
    } catch (error) {
      return {
        status: "error",
        timestamp: new Date(),
        database: "disconnected",
      };
    }
  }
}