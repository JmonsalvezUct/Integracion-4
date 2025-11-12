import { prisma } from "../../app/loaders/prisma.js";

export const usersService = {
  async getUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        createdAt: true,
      },
    });
  },

  async updateUser(id: number, data: any) {

    const { name, profilePicture } = data;

    return prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(profilePicture && { profilePicture }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
      },
    });
  },
};
