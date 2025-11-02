import { useEffect, useState } from 'react';
import {apiFetch} from '../../../../lib/api-fetch';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  profilePicture: string | null;
}

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: string;
  user: User;
}

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    apiFetch(`/projects/${projectId}/members`)
      .then((response) => response.json())
      .then((data: ProjectMember[]) => {
        console.log(data)
        setMembers(data);
        setError(null);
      })
      .catch((err) => {
        setError('Error al cargar miembros');
        setMembers([]);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  return { members, loading, error };
}
