import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { getAccessToken } from "@/lib/secure-store";
import { ProjectMember } from "../types/ProjectMember";
import { Alert } from "react-native";

export function useProjectMembers(projectId: number) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const token = await getAccessToken();
      const res = await apiFetch(`/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json(); 
      setMembers(data);
    } catch (err) {
      console.log("Error cargando miembros", err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: number, role: string) => {
    const token = await getAccessToken();
    await apiFetch(`/projects/${projectId}/members/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    load();
  };

const removeMember = async (userId: number) => {
  try {
    setLoading(true);
    const token = await getAccessToken();

    const res = await apiFetch(`/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si el backend envía error, lanzarlo
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "No se pudo eliminar al usuario");
    }

    // Actualizar lista
    setMembers((prev) => prev.filter((m) => m.userId !== userId));

  } catch (err: any) {
    Alert.alert("No permitido", err.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    load();
  }, []);

  return { members, loading, updateRole, removeMember };
}
