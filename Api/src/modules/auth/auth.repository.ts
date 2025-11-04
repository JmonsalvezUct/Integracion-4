import { prisma } from '../../app/loaders/prisma.js';

export const authRepository = {
  findUserByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),
  
  findUserWithProjects: (userId: number) =>
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),


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

  saveResetToken: (email: string, token: string, expires: Date) =>
    prisma.user.update({where: { email }, data: {resetToken: token, resetTokenExpires: expires}}),

  findUserByResetToken: (token: string) => 
   prisma.user.findFirst({where: {resetToken: token, resetTokenExpires: { gte: new Date() }}}),
  
  updatePassword: (userId: number, hashedPassword: string) =>
    prisma.user.update({where: { id: userId }, data: {password: hashedPassword, resetToken: null, resetTokenExpires: null}})
};
