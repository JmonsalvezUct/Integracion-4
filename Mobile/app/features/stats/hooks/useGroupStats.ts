import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api-fetch';

export interface GroupStats {
  completedCount: number;
  totalMinutes: number;
  totalHours: number;
  avgMinutesPerTask: number;
  workedDates: string[];
  burndown: Record<string, number>;
  timeBurndown: Record<string, number>;
  teamMembers: {
    userId: number;
    name: string;
    minutes: number;
    hours: number;
    completedTasks: number;
  }[];
}

export function useGroupStats(projectId: string, from: string, to: string) {
  const [statsGroup, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {


    if (!projectId) return;

    setLoading(true);
    console.log("Fetching group stats for project:", projectId, "from:", from, "to:", to);
    apiFetch(`/stats/project/${projectId}/group-stats`, {
      method: 'POST',
      body: JSON.stringify({ from, to }),
    })
      .then((response) => response.json())
      .then((data: GroupStats) => {

        setStats(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error en useGroupStats:", err);
        setError('Error al cargar estadísticas grupales');
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, [projectId, from, to]);

  return { statsGroup, loading, error };
}
