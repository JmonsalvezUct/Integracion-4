import { useEffect, useState, useCallback } from "react";
import { listMyInvitations, acceptInvitation, rejectInvitation } from "../invitations.api";
import type { Invitation } from "../types";

export function useMyInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listMyInvitations();
      setInvitations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleAccept(id: number) {
    await acceptInvitation(id);
    load();
  }

  async function handleReject(id: number) {
    await rejectInvitation(id);
    load();
  }

  useEffect(() => {
    load();
  }, [load]);

  return { invitations, loading, error, handleAccept, handleReject, refetch: load };
}
