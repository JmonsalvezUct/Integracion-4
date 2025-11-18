import React, {
  useState,
  useEffect,
  useCallback
} from "react";

import * as SecureStore from "expo-secure-store";
import { apiFetch } from "@/lib/api-fetch";
import { getAccessToken } from "@/lib/secure-store";
import { getTaskStatus } from "../utils/utilsProject";

import type {
  ProjectDetail,
  Owner,
  Member,
  TaskMetrics,
  Task
} from "@/types/project";



// ----------------------------
// 🔥 AQUI COMIENZA EL HOOK REAL
// ----------------------------
export function useProjectDetail(projectId?: number | null) {

  // ----------------------------
  // ESTADOS (TUS MISMOS useState)
  // ----------------------------
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const [taskMetrics, setTaskMetrics] = useState<TaskMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // etiquetas
  const [tags, setTags] = useState<{ id: number; name: string; color?: string }[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loadingTags, setLoadingTags] = useState(false);


  // ----------------------------
  // TAGS
  // ----------------------------
  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      const token = await getAccessToken();

      const res = await apiFetch(`/tags/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando etiquetas:", err);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;

    try {
      const token = await getAccessToken();

      const res = await apiFetch(`/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTag.trim(), projectId }),
      });

      if (!res.ok) throw new Error(await res.text());

      setNewTag("");
      await fetchTags();
    } catch (err) {
      console.error("Error creando etiqueta:", err);
    }
  };


  useEffect(() => {
    if (projectId) fetchTags();
  }, [projectId]);


  // ----------------------------
  // TAREAS
  // ----------------------------
  const fetchProjectTasks = async (projectId: number) => {
    try {
      const tasksRes = await apiFetch(`/tasks/projects/${projectId}/tasks`);
      if (!tasksRes.ok) return [];

      const tasksData = await tasksRes.json();

      let tasks: Task[] = [];
      if (Array.isArray(tasksData)) tasks = tasksData;
      else if (tasksData && typeof tasksData === "object") tasks = [tasksData];

      return tasks;
    } catch (error) {
      console.error("❌ Error cargando tareas:", error);
      return [];
    }
  };


  // ----------------------------
  // MÉTRICAS
  // ----------------------------
  const fetchTaskMetrics = async (projectId: number) => {
    if (!projectId) return;

    setMetricsLoading(true);
    try {
      const projectTasks = await fetchProjectTasks(projectId);

      const metrics: TaskMetrics = {
        totalTasks: projectTasks.length,
        tasksByStatus: { created: 0, in_progress: 0, completed: 0 },
        tasksByMember: [],
      };

      projectTasks.forEach((task: Task) => {
        const status = getTaskStatus(task);

        metrics.tasksByStatus.created++;
        if (status.inProgress) metrics.tasksByStatus.in_progress++;
        if (status.completed) metrics.tasksByStatus.completed++;
      });

      const memberTaskCounts: { [key: number]: { count: number; name: string } } = {};

      projectTasks.forEach((task: Task) => {
        const assigneeId =
          task.assigneeId ||
          task.assigneeld ||
          (task.assignee ? task.assignee.id : null);

        const assigneeName = task.assignee?.name || "Sin asignar";
        const effectiveAssigneeId = assigneeId || 0;

        if (!memberTaskCounts[effectiveAssigneeId]) {
          memberTaskCounts[effectiveAssigneeId] = { count: 0, name: assigneeName };
        }

        memberTaskCounts[effectiveAssigneeId].count++;
      });

      metrics.tasksByMember = Object.entries(memberTaskCounts).map(
        ([memberId, data]) => ({
          memberId: Number(memberId),
          memberName: data.name,
          taskCount: data.count,
        })
      );

      setTaskMetrics(metrics);
    } catch (error) {
      console.error("❌ Error cargando métricas:", error);

      setTaskMetrics({
        totalTasks: 0,
        tasksByStatus: { created: 0, in_progress: 0, completed: 0 },
        tasksByMember: [],
      });
    } finally {
      setMetricsLoading(false);
    }
  };


  // ----------------------------
  // OWNER & MEMBER
  // ----------------------------
  const setupCurrentUserAsOwnerAndMember = async (userId: number) => {
    try {
      const userName = await SecureStore.getItemAsync("userName");
      const userEmail = await SecureStore.getItemAsync("userEmail");

      const ownerInfo: Owner = {
        id: userId,
        name: userName || "Usuario",
        email: userEmail || "usuario@ejemplo.com",
        role: "admin",
      };

      setOwner(ownerInfo);

      const memberInfo: Member = {
        id: userId,
        name: userName || "Usuario",
        email: userEmail || "usuario@ejemplo.com",
        role: "Administrador",
      };

      setMembers([memberInfo]);
    } catch (error) {
      console.error("❌ Error estableciendo usuario como owner/miembro:", error);
    }
  };


  // ----------------------------
  // CARGA PRINCIPAL
  // ----------------------------
  const fetchData = useCallback(async () => {
    if (!projectId) {
      setError("ID de proyecto no válido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projRes = await apiFetch(`/projects/${projectId}`);

      if (!projRes.ok) {
        const errorText = await projRes.text();
        throw new Error(errorText);
      }

      const projData = await projRes.json();

      const projectDetail: ProjectDetail = {
        id: projData.id,
        name: projData.name,
        description: projData.description || null,
        status: projData.status,
        startDate: projData.startDate,
        endDate: projData.endDate,
        createdAt: projData.createdAt,
      };

      setProject(projectDetail);

      const uidStr = await SecureStore.getItemAsync("userId");
      const uid = uidStr ? Number(uidStr) : NaN;

      if (Number.isFinite(uid)) {
        await setupCurrentUserAsOwnerAndMember(uid);
      }

      await fetchTaskMetrics(projectId);
    } catch (err: any) {
      setError(err?.message ?? "Error desconocido");
      setProject(null);
      setOwner(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // ----------------------------
  // REFRESH
  // ----------------------------
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);


  // ----------------------------
  // RETORNO DEL HOOK
  // ----------------------------
  return {
    loading,
    refreshing,
    error,

    project,
    owner,
    members,

    taskMetrics,
    metricsLoading,

    tags,
    loadingTags,
    newTag,
    setNewTag,
    handleCreateTag,

    onRefresh,
  };
}
