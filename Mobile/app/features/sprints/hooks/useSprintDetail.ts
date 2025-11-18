import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { Alert, DeviceEventEmitter } from "react-native";
import { useTasks } from "../../task/hooks/usetask";

export const useSprintDetail = (projectId: number, sprintId: number) => {
  const [sprint, setSprint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const { tasks, fetchTasks } = useTasks(projectId);

  const fetchSprint = async () => {
    try {
      const res = await apiFetch(`/projects/${projectId}/sprints/${sprintId}`);
      const data = await res.json();
      setSprint(data);
    } catch {
      Alert.alert("Error", "No se pudo cargar el sprint.");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchSprint(), fetchTasks()]);
      setLoading(false);
    };
    load();
  }, []);

  const toggleTask = async (task: any) => {
    Alert.alert(
      "Confirmar",
      task.sprintId === sprintId
        ? `¿Deseas quitar "${task.title}" de este sprint?`
        : `¿Deseas asignar "${task.title}" a este sprint?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            setAssigning(true);
            try {
              await apiFetch(`/tasks/${task.id}/assign-sprint`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sprintId: task.sprintId === sprintId ? null : sprintId,
                }),
              });
              await fetchTasks();
            } catch {
              Alert.alert("Error", "No se pudo actualizar la tarea.");
            } finally {
              setAssigning(false);
            }
          },
        },
      ]
    );
  };

  const changeState = async () => {
    Alert.alert(
      "Confirmar cambio de estado",
      `¿Deseas ${sprint.isActive ? "finalizar" : "reactivar"} este sprint?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              await apiFetch(`/projects/${projectId}/sprints/${sprintId}/finalize`, {
                method: "PATCH",
              });
              fetchSprint();
            } catch {
              Alert.alert("Error", "No se pudo cambiar el estado del sprint.");
            }
          },
        },
      ]
    );
  };

  const deleteSprint = async (router: any) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Seguro que deseas eliminar este sprint?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await apiFetch(
                `/projects/${projectId}/sprints/${sprintId}`,
                { method: "DELETE" }
              );
              if (!res.ok) throw new Error();

              DeviceEventEmitter.emit("SPRINT_UPDATED");
              router.back();
            } catch {
              Alert.alert("Error", "No se pudo eliminar el sprint.");
            }
          },
        },
      ]
    );
  };

  return {
    sprint,
    loading,
    assigning,
    tasks,
    toggleTask,
    changeState,
    deleteSprint,
  };
};
