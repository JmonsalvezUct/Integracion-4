    import { useEffect, useMemo, useState } from "react";
    import { getAccessToken } from "@/lib/secure-store";
    import type { Task, User } from "../types";

    const API_BASE = "https://integracion-4.onrender.com";

    export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]); 
    const [projectName, setProjectName] = useState("");
    const [filters, setFilters] = useState({ status: "", assignee: "", dueDate: "" });
    const [sortBy, setSortBy] = useState<"title" | "priority" | "dueDate" | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [currentStartDate, setCurrentStartDate] = useState(new Date());

    const projectId = 1;

    const fetchTasks = async () => {
        try {
        const token = await getAccessToken();
        const res = await fetch(`${API_BASE}/api/tasks/projects/${projectId}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
        if (data.length > 0) setProjectName(data[0]?.project?.name || "Proyecto");
        } catch (err) {
        console.error("❌ Error al cargar tareas:", err);
        }
    };


    const fetchProjectMembers = async () => {
        try {
        const token = await getAccessToken();
        const res = await fetch(`${API_BASE}/api/projects/${projectId}/members`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();


        const formatted = data.map((m: any) => ({
        id: m.user?.id ?? m.userId,
        name: m.user?.name || m.user?.username || m.user?.email || "Sin nombre",
        }));


        setUsers(formatted);
        } catch (err) {
        console.error(" Error al cargar miembros del proyecto:", err);
        }
    };

    const assignTaskToUser = async (taskId: number, userId: number) => {
    try {
        const token = await getAccessToken();
        const url = `${API_BASE}/api/tasks/${projectId}/${taskId}/assign`;
        console.log("📡 POST:", url);
        console.log("📦 Payload:", { assigneeId: userId });

        const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ assigneeId: userId }),
        });

        const data = await res.json();
        console.log("🧩 Response:", data);

        if (!res.ok) {
        console.error("❌ Error al asignar:", data);
        throw new Error(data.error || "Error al asignar la tarea");
        }


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

        console.log(" Tarea asignada correctamente");
    } catch (err) {
        console.error(" Error al asignar tarea:", err);
    }
    };




    const visibleTasks = useMemo(() => {
        let filtered = tasks.filter((t) => {
        const matchStatus = filters.status
            ? t.status?.toLowerCase().includes(filters.status.toLowerCase())
            : true;
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


    useEffect(() => {
        fetchTasks();
        fetchProjectMembers(); 
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
    };
    }
