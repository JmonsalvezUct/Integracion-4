import { prisma } from '../../app/loaders/prisma.js';
export const authRepository = {
    findUserByEmail: (email) => prisma.user.findUnique({ where: { email } }),
    createUser: (data) => prisma.user.create({ data }),
    findUserById: (id) => prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, profilePicture: true, createdAt: true } }),
    createRefreshToken: (data) => prisma.refreshToken.create({ data }),
    findRefreshToken: (token) => prisma.refreshToken.findUnique({ where: { token } }),
    deleteRefreshToken: (token) => prisma.refreshToken.delete({ where: { token } }),
    deleteAllUserRefreshTokens: (userId) => prisma.refreshToken.deleteMany({ where: { userId } }),
    saveResetToken: (email, token, expires) => prisma.user.update({ where: { email }, data: { resetToken: token, resetTokenExpires: expires } }),
    findUserByResetToken: (token) => prisma.user.findFirst({ where: { resetToken: token, resetTokenExpires: { gte: new Date() } } }),
    updatePassword: (userId, hashedPassword) => prisma.user.update({ where: { id: userId }, data: { password: hashedPassword, resetToken: null, resetTokenExpires: null } })
};
//# sourceMappingURL=auth.repository.js.map