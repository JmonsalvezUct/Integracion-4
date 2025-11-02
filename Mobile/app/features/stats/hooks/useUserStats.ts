import { useEffect, useState } from 'react';
import {apiFetch} from '../../../../lib/api-fetch';

export interface UserStats {
  completedTasksCount: number;
  assignedTasksCount: number;
  totalMinutes: number;
  totalHours: number;
  workedDates: string[];
  burndown: Record<string, number>;
  timeBurndown: Record<string, number>;
}

export function useUserStats(projectId: string, userId: number, from: string, to: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("userID en useuserstats", userId);
    console.log("projectID en useuserstats", projectId);
    console.log("JSON.stringify({ userId, from, to })", JSON.stringify({ userId, from, to }));
    if (!projectId || !userId) return;
    setLoading(true);
    apiFetch(`/stats/project/${projectId}/user-stats`, {
      method: 'POST',
      body: JSON.stringify({ userId, from, to })
    })
      .then((response) => response.json())
      .then((data: UserStats) => {
        console.log("EStadisticas 😀 ", data)
        setStats(data);
        setError(null);
      })
      .catch((err) => {
        setError('Error al cargar estadísticas');
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, [projectId, userId, from, to]);

  return { stats, loading, error };
}
