import { useAuth } from "@/hooks/useAuth";

import { can } from "../../../../../Api/src/utils/checkPermission"


export function usePermissions(projectId?: number) {
  const { user } = useAuth();

  const role = user?.projects?.find(p => p.projectId === projectId)?.role;

  return {
    role,
    can: (resource: string, action: string) =>
      can(role, resource, action),
  };
}
