import { Permissions } from "../config/permissions";
import type { Role } from "../config/permissions";

export function can(
  role: Role | undefined,
  resource: string,
  action: string
) {
  const resourcePerms = Permissions[resource as keyof typeof Permissions];

  if (!resourcePerms) return false;

  const validRoles = [
    ...(resourcePerms[action as keyof typeof resourcePerms] ?? []),
  ] as Role[];

  return validRoles.includes(role ?? "guest");
}
