import { useEffect, useMemo, useState, useCallback } from "react";
import { getAccessToken } from "@/lib/secure-store";
import type { Task, User } from "../types";
import { apiFetch } from "@/lib/api-fetch";
import { DeviceEventEmitter } from "react-native";

const TASK_UPDATED = "TASK_UPDATED";

export interface TaskHistoryEntry {
  id: number;
  date: string;
  description: string;
  action: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export function useTaskHistory(
  projectId?: string | number,
  taskId?: string | number
) {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!projectId || !taskId) {
      console.warn(
        "⚠️ No se proporcionaron projectId o taskId en useTaskHistory()"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      const res = await apiFetch(
        `/history/projects/${projectId}/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setHistory([]);
        return;
      }

      setHistory(data);
    } catch (err: any) {
      console.error("Error al cargar historial:", err);
      setError(err.message || "Error al cargar historial");
    } finally {
      setLoading(false);
    }
  }, [projectId, taskId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refresh: fetchHistory };
}

const normalize = (v?: string) =>
  (v ?? "").toLowerCase().trim().replace(/\s+/g, "_");

export function useTasks(projectId?: string | number) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    assignee: "",
    dueDate: "",
    search: "",
    tag: "",
    priority: "",
  });
  const [sortBy, setSortBy] = useState<
    "title" | "priority" | "dueDate" | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [users, setUsers] = useState<User[]>([]);

  const CL_TZ = "America/Santiago";
  const CL_TZ = "America/Santiago";

  const fetchTasks = async () => {
    try {
      if (!projectId) {
        console.warn(" No se proporcionó projectId en useTasks()");
        return;
      }

      const token = await getAccessToken();
      const res = await apiFetch(`/tasks/projects/${projectId}/tasks`);
      const token = await getAccessToken();
      const res = await apiFetch(`/tasks/projects/${projectId}/tasks`);

      if (!res.ok) throw new Error(await res.text());
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const data = await res.json();

      const taskList = Array.isArray(data) ? data : data.tasks ?? [];
      const taskList = Array.isArray(data) ? data : data.tasks ?? [];

      setTasks(taskList);
      setProjectName(
        taskList[0]?.project?.name ?? `Proyecto #${projectId}`
      );
    } catch (err) {
      console.error(" Error al cargar tareas:", err);
    }
  };

  // 🔥 FUNCIÓN AÑADIDA DE LA RAMA 'javier'
  const updateTaskDate = async (taskId: number, newDate: Date) => {
    try {
      console.log(
        `🔄 Actualizando tarea ${taskId} a fecha: ${newDate.toISOString()}`
      );

      const token = await getAccessToken();

      // Usamos el endpoint de tu documentación: PUT /tasks/projects/(projectId)/tasks/(taskId)
      const res = await apiFetch(
        `/tasks/projects/${projectId}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dueDate: newDate.toISOString(), // Formato ISO para la API
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error en la actualización");
      }

      const updatedTask = await res.json();
      console.log("✅ Tarea actualizada:", updatedTask);

      // Actualizar el estado local
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, dueDate: newDate.toISOString() }
            : task
        )
      );
      
      // Emitir evento para actualizar otras partes (como detail_task)
      DeviceEventEmitter.emit(TASK_UPDATED, { task: updatedTask });

      return updatedTask;
    } catch (error) {
      console.error("❌ Error actualizando fecha de tarea:", error);
      throw error;
    }
  };

  const assignTaskToUser = async (taskId: number, userId: number) => {
    try {
      const token = await getAccessToken();
      const res = await apiFetch(`/tasks/${projectId}/${taskId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: userId }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                assignee: {
                  name: users.find((u) => u.id === userId)?.name || "—",
                },
              }
            : t
        )
      );
    } catch (err) {
      console.error("Error al asignar tarea:", err);
    }
  };

  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];

    return tasks.filter((task) => {
      if (!task.dueDate) {
        return false;
      }

      try {
        const taskDate = new Date(task.dueDate);
        const isSameDate =
          taskDate.getDate() === selectedDate.getDate() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getFullYear() === selectedDate.getFullYear();

        return isSameDate;
      } catch (error) {
        return false;
      }
    });
  }, [tasks, selectedDate]);

  const visibleTasks = useMemo(() => {
    let filtered = tasks.filter((t) => {
      const matchStatus = filters.status
        ? normalize(t.status) === normalize(filters.status)
        : true;

      const matchAssignee = filters.assignee
        ? t.assignee?.name
            ?.toLowerCase()
            .includes(filters.assignee.toLowerCase())
        : true;

      const matchDate = filters.dueDate
        ? t.dueDate?.startsWith(filters.dueDate)
        : true;

      const matchTag = filters.tag
        ? t.tags?.some((tt: any) =>
            tt.tag?.name?.toLowerCase().includes(filters.tag.toLowerCase())
          )
        : true;

      const matchPriority = filters.priority
        ? t.priority?.toLowerCase().includes(filters.priority.toLowerCase())
        : true;

      // Lógica de búsqueda de la rama 'develop'
      const matchSearch = filters.search
        ? (t.title ?? "").toLowerCase().includes(filters.search.toLowerCase()) ||
          (t.tags ?? []).some((tt: any) =>
            tt.tag?.name?.toLowerCase().includes(filters.search.toLowerCase())
          )
        : true;

      return (
        matchStatus &&
        matchAssignee &&
        matchDate &&
        matchTag &&
        matchPriority &&
        matchSearch // Asegurarse de incluir matchSearch
      );
    });

  if (!sortBy) return filtered;

    const sorted = [...filtered].sort((a, b) => {
      let valA: any, valB: any;
      switch (sortBy) {
        case "title":
          valA = a.title?.toLowerCase() || "";
          valB = b.title?.toLowerCase() || "";
          break;
        case "priority":
          const order: Record<"high" | "medium" | "low", number> = {
            high: 3,
            medium: 2,
            low: 1,
          };
          valA = order[a.priority as keyof typeof order] || 0;
          valB = order[b.priority as keyof typeof order] || 0;
          break;
        case "dueDate":
          valA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          valB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [tasks, filters, sortBy, sortDirection]);

  const fetchUsers = async () => {
    try {
      if (!projectId) return;

      const token = await getAccessToken();
      const res = await apiFetch(`/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(await res.text());
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const data = await res.json();

      const list = Array.isArray(data)
        ? data.map((member) => ({
            id: member.user?.id,
            name: member.user?.name,
          }))
        : [];

      setUsers(list);
    } catch (err) {
      console.error("Error al cargar miembros del proyecto:", err);
    }
  };

  useEffect(() => {
    if (!projectId) {
      console.warn(" No se proporcionó projectId en useTasks()");
      return;
    }
    fetchTasks();
    fetchUsers();
  }, [projectId]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      TASK_UPDATED,
      ({ task: updated }: any) => {
        if (!updated) return;

        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
        );
      }
    );

    return () => sub.remove();
  }, []);

  return {
    tasks: visibleTasks,
    // 🔥 IMPORTANTE: Pasamos 'tasks' (la lista COMPLETA) para el calendario
    allTasksForCalendar: tasks, 
    projectName,
    filters,
    setFilters,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    assignTaskToUser,
    currentStartDate,
    setCurrentStartDate,
    users,
    selectedDate,
    setSelectedDate,
    tasksForSelectedDate,
    fetchTasks,
    updateTaskDate, // 🔥 EXPORTACIÓN AÑADIDA
  };
}