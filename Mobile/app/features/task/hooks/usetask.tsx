    import { useEffect, useMemo, useState, useCallback  } from "react";
    import { getAccessToken } from "@/lib/secure-store";
    import type { Task, User } from "../types";
    import { apiFetch } from "@/lib/api-fetch";

    // 🔔 Sincronización global de estado de tareas (Kanban / Detalle / Lista)
import { DeviceEventEmitter } from "react-native";
const TASK_UPDATED = "TASK_UPDATED";

    

    export interface TaskHistoryEntry {
    id: number;
    date: string;
    description: string;
    action: {
        id: number;
        action: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
}
    export function useTaskHistory(taskId?: string | number) {
    const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!taskId) {
        console.warn("⚠️ No se proporcionó taskId en useTaskHistory()");
        return;
        }

        setLoading(true);
        setError(null);

        try {
        const token = await getAccessToken();
        const data = await apiFetch(`/history/task/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });


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
    }, [taskId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, error, refresh: fetchHistory };
    }


    
export function useTasks(projectId?: string | number) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projectName, setProjectName] = useState("");
    const [filters, setFilters] = useState({ status: "", assignee: "", dueDate: "" });
    const [sortBy, setSortBy] = useState<"title" | "priority" | "dueDate" | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [currentStartDate, setCurrentStartDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [users, setUsers] = useState<User[]>([]); 
    



    const CL_TZ = "America/Santiago";

    const fetchTasks = async () => {
        try {
        if (!projectId) {
            console.warn(" No se proporcionó projectId en useTasks()");
            return;
        }

        const token = await getAccessToken();
        const res = await apiFetch(`/tasks/projects/${projectId}/tasks`);

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();


        const taskList = Array.isArray(data) ? data : data.tasks ?? [];

        setTasks(taskList);
        setProjectName(taskList[0]?.project?.name ?? `Proyecto #${projectId}`);
        } catch (err) {
        console.error(" Error al cargar tareas:", err);
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
            t.id === taskId ? { ...t, assignee: { name: users.find((u) => u.id === userId)?.name || "—" } } : t
            )
        );
        } catch (err) {
        console.error("Error al asignar tarea:", err);
        }
    };

    const tasksForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        
        console.log("Filtrando tareas para:", selectedDate.toLocaleDateString());
        
        return tasks.filter(task => {
        if (!task.dueDate) {
            return false;
        }
        
        try {
            const taskDate = new Date(task.dueDate);
            const isSameDate = 
            taskDate.getDate() === selectedDate.getDate() &&
            taskDate.getMonth() === selectedDate.getMonth() &&
            taskDate.getFullYear() === selectedDate.getFullYear();
            
            if (isSameDate) {
            console.log("Tarea encontrada para esta fecha:", task.title);
            }
            
            return isSameDate;
        } catch (error) {
            console.log(" Error procesando fecha de tarea:", task.title, task.dueDate);
            return false;
        }
        });
    }, [tasks, selectedDate]);

    const visibleTasks = useMemo(() => {
        let filtered = tasks.filter((t) => {
        const matchStatus = filters.status ? t.status?.toLowerCase().includes(filters.status.toLowerCase()) : true;
        const matchAssignee = filters.assignee
            ? t.assignee?.name?.toLowerCase().includes(filters.assignee.toLowerCase())
            : true;
        const matchDate = filters.dueDate ? t.dueDate?.startsWith(filters.dueDate) : true;
        return matchStatus && matchAssignee && matchDate;
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
            const order: Record<"high" | "medium" | "low", number> = { high: 3, medium: 2, low: 1 };
            const priorityA = a.priority as "high" | "medium" | "low" | undefined;
            const priorityB = b.priority as "high" | "medium" | "low" | undefined;
            valA = priorityA ? order[priorityA] : 0;
            valB = priorityB ? order[priorityB] : 0;
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

    // 🔔 Escucha cambios globales de estado (desde Kanban o Detalle)
    useEffect(() => {
    const sub = DeviceEventEmitter.addListener(TASK_UPDATED, ({ task: updated }: any) => {
        if (!updated) return;

        setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
        );
    });

    return () => sub.remove();
    }, []);


    return {
        tasks: visibleTasks,
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
    };
}