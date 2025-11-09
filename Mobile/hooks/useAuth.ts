import { useEffect, useState, useCallback } from "react";
import { getAccessToken, clearAuth } from "@/lib/secure-store";
import { apiFetch } from "@/lib/api-fetch";

interface ProjectInfo {
  projectId: number;
  projectName: string;
  role: string;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  projects?: ProjectInfo[];
}

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const role = user?.projects?.length
    ? user.projects[0].role
    : "guest";

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }

      const res = await apiFetch("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Invalid token");

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.warn("Auth error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    await clearAuth();
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    role,
    loading,
    logout,
    refresh: fetchUser,
  };
}
