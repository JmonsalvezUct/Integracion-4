import { prisma } from "../../app/loaders/prisma.js";

export type Role = "owner" | "admin" | "member";

export async function getMembershipRole(
  userId: number,
  projectId: number
): Promise<Role | null> {
  const m = await prisma.userProject.findFirst({
    where: { userId, projectId },
    select: { role: { select: { role: true } } }, 
  });
  return (m?.role.role as Role) ?? null;
}