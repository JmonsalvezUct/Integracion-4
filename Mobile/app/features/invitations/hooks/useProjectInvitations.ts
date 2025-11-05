import { useEffect, useState, useCallback } from "react";
import { listProjectInvitations   } from "@/app/features/invitations/invitations.api";
import type { Invitation } from "../types";

export function useProjectInvitations(projectId: number, status?: string) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listProjectInvitations(projectId, status);
      setInvitations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, status]);

  useEffect(() => {
    load();
  }, [load]);

  return { invitations, loading, error, refetch: load };
}