import { prisma } from '../../app/loaders/prisma.js';

export const authRepository = {
  findUserByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  createUser: (data: { name: string; email: string; password: string; profilePicture?: string }) =>
    prisma.user.create({ data }),

  findUserById: (id: number) =>
    prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, profilePicture: true, createdAt: true } }),

  createRefreshToken: (data: { token: string; userId: number; userAgent?: string; expiresAt: Date }) =>
    prisma.refreshToken.create({ data }),

  findRefreshToken: (token: string) =>
    prisma.refreshToken.findUnique({ where: { token } }),

  deleteRefreshToken: (token: string) =>
    prisma.refreshToken.delete({ where: { token } }),

  deleteAllUserRefreshTokens: (userId: number) =>
    prisma.refreshToken.deleteMany({ where: { userId } }),
};
