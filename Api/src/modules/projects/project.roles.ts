import { prisma } from "../../lib/prisma";
import type { Role } from "./project.membership";

export async function getRoleId(name: string): Promise<number> {
  const r = await prisma.projectRole.findUnique({
    where: { role: name },
    select: { id: true }
  });
  if (!r) throw new Error(`Role not found: ${name}`);
  return r.id;
}
