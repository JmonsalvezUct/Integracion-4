import { Permissions, type Resource, type Action, type Role } from "../config/permissions.js";

export function can<R extends Resource>(
  role: Role | undefined,
  resource: R,
  action: Action<R>
) {
  const validRoles = (Permissions[resource]?.[action] ?? []) as readonly Role[];

  return validRoles.includes(role ?? "guest");
}
