import { useAuth } from "@/hooks/useAuth";
import { can } from "@/app/utils/checkPermission";
import type { Role } from "@/app/config/permissions";

export function usePermissions(projectId?: number) {
  const { user } = useAuth();

  
  const role =
  (user?.projects?.find((p) => p.projectId === projectId)?.role as Role) ??
  "guest";


  return {
    role,
    can: (resource: string, action: string) => can(role, resource, action),
  };
}
