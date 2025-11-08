import { useCallback, useEffect, useState } from "react";
import {
  listMyInvitations,
  acceptInvitation,
  rejectInvitation
} from "../invitations.api";

export function useInvitations() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMyInvitations();
      setInvitations(data);
    } catch (e) {
      console.error("Error loading invitations:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAccept = async (id: number) => {
    await acceptInvitation(id);
    await load();
  };

  const handleReject = async (id: number) => {
    await rejectInvitation(id);
    await load();
  };

  useEffect(() => {
    load();
  }, [load]);

  return {
    invitations,
    loading,
    handleAccept,
    handleReject,
    reload: load,
  };
}
