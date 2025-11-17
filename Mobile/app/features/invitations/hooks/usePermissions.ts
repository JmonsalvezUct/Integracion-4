import { useAuth } from "@/hooks/useAuth";
import { can } from "@/app/utils/checkPermission";
import type { Role } from "@/app/config/permissions";

function normalizeRole(value: string | undefined): Role {
  if (value === "admin" || value === "developer" || value === "guest") {
    return value;
  }
  return "guest";
}

export function usePermissions(projectId?: number) {
  const { user } = useAuth();

  const normalizedId = Number(projectId);

  const rawRole = user?.projects?.find(
    (p) => Number(p.projectId) === normalizedId
  )?.role;

  const role = normalizeRole(rawRole);



  return {
    role,
    can: (resource: string, action: string) => can(role, resource, action),
  };
}
