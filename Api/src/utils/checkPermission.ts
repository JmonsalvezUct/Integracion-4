import { Permissions } from "../config/permissions";
import type { Role } from "../config/permissions";

export function can(role: Role | undefined, resource: string, action: string) {
  const validRoles = Permissions?.[resource as keyof typeof Permissions]?.[action] ?? [];
  return validRoles.includes(role ?? "guest");
}
