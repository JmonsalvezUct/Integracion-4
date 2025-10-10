import { useEffect, useMemo, useState } from "react";
import { getAccessToken } from "@/lib/secure-store";
import type { Task, User } from "../types";

const API_BASE = "https://integracion-4.onrender.com";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [filters, setFilters] = useState({ status: "", assignee: "", dueDate: "" });
  const [sortBy, setSortBy] = useState<"title" | "priority" | "dueDate" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [users] = useState<User[]>([
    { id: 1, name: "Ana Pérez" },
    { id: 2, name: "Carlos Gómez" },
    { id: 3, name: "Lucía Torres" },
  ]);

  const projectId = 1;

  const fetchTasks = async () => {
    try {
      const token = await getAccessToken();
      console.log("🔑 Token obtenido:", token ? "SÍ" : "NO");
      
      const res = await fetch(`${API_BASE}/api/tasks/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("📡 Estado de respuesta:", res.status, res.statusText);
      
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      console.log("📦 Tareas recibidas:", data);
      
      // Asegurarnos de que siempre sea un array
      const tasksArray = Array.isArray(data) ? data : [];
      setTasks(tasksArray);
      
      if (tasksArray.length > 0) {
        setProjectName(tasksArray[0]?.project?.name || "Proyecto");
        console.log("🏷️ Proyecto:", tasksArray[0]?.project?.name);
      } else {
        setProjectName("Proyecto Sin Tareas");
        console.log("⚠️ No hay tareas en el proyecto");
      }
    } catch (err) {
      console.error("❌ Error al cargar tareas:", err);
      // Datos de ejemplo para testing
      const exampleTasks: Task[] = [
        {
          id: 1,
          title: "Diseñar interfaz de usuario",
          description: "Crear mockups para la nueva funcionalidad",
          status: "in_progress",
          priority: "high",
          dueDate: new Date().toISOString(),
          assignee: { name: "Ana Pérez" },
          project: { name: "App Móvil" }
        },
        {
          id: 2,
          title: "Revisar código backend",
          description: "Revisar pull request del módulo de autenticación",
          status: "pending",
          priority: "medium",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: { name: "Carlos Gómez" },
          project: { name: "App Móvil" }
        },
        {
          id: 3,
          title: "Documentación API",
          description: "Actualizar documentación de endpoints",
          status: "completed",
          priority: "low",
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: { name: "Lucía Torres" },
          project: { name: "App Móvil" }
        }
      ];
      setTasks(exampleTasks);
      setProjectName("App Móvil");
    }
  };

  const assignTaskToUser = async (taskId: number, userId: number) => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`${API_BASE}/api/tasks/${projectId}/${taskId}/assign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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

  // Filtrar tareas para la fecha seleccionada
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    console.log("📅 Filtrando tareas para:", selectedDate.toLocaleDateString());
    
    return tasks.filter(task => {
      if (!task.dueDate) {
        console.log("❌ Tarea sin fecha:", task.title);
        return false;
      }
      
      try {
        const taskDate = new Date(task.dueDate);
        const isSameDate = 
          taskDate.getDate() === selectedDate.getDate() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getFullYear() === selectedDate.getFullYear();
        
        if (isSameDate) {
          console.log("✅ Tarea encontrada para esta fecha:", task.title);
        }
        
        return isSameDate;
      } catch (error) {
        console.log("❌ Error procesando fecha de tarea:", task.title, task.dueDate);
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

  useEffect(() => {
    fetchTasks();
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
  };
}