
  // ---------- utils ----------
export const pad = (n: number) => String(n).padStart(2, "0");

export const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};

  // MISMA LÓGICA QUE TASKSCREEN - Función para determinar el estado basado en fechas
export const getTaskStatus = (task: any) => {
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const created = true;
    const inProgress = !dueDate || dueDate > now;
    const completed = dueDate && dueDate <= now;
    return { created, inProgress, completed };
  };


// Traducción del estado
export const getStatusName = (status: string) => {
    switch (status) {
      case "created":
        return "Creadas";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completadas";
      default:
        return status;
    }
  };
// Color asociado al estado
export const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "#666666";
      case "in_progress":
        return "#FFA500";
      case "completed":
        return "#1a8f2e";
      default:
        return "#666666";
    }
  };