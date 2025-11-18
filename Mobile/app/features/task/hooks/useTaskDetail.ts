import { useState, useEffect, useCallback } from "react";
import { Alert, DeviceEventEmitter } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { apiFetch } from "@/lib/api-fetch";
import { getAccessToken } from "@/lib/secure-store";

const TASK_UPDATED = "TASK_UPDATED";

export function useTaskDetail(taskId?: number | string, taskDataParam?: string) {


  // ---------------------------------------------------------
  // 1) ESTADOS PRINCIPALES
  // ---------------------------------------------------------
  const [task, setTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<any>({});
  const [newComment, setNewComment] = useState("");

  // ---------------------------------------------------------
  // 2) ESTADOS UI: pickers y modales
  // ---------------------------------------------------------
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const [attachModalVisible, setAttachModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [projectMembers, setProjectMembers] = useState<Array<{ id: number; name: string }>>([]);

  const [dueDateEditingValue, setDueDateEditingValue] = useState<string | null>(null);

  // Vista de archivos
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  // ---------------------------------------------------------
  // 3) ETIQUETAS
  // ---------------------------------------------------------
  const [projectTags, setProjectTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [showTagPicker, setShowTagPicker] = useState(false);

  const STATUS_OPTIONS = ["created", "in_progress", "completed", "archived"];
  const PRIORITY_OPTIONS = ["high", "medium", "low"];

  // ---------------------------------------------------------
  // 4) CARGA DE ETIQUETAS DEL PROYECTO
  // ---------------------------------------------------------
  useEffect(() => {
    const projectId = task?.projectId ?? task?.project?.id;
    if (!projectId) return;

    (async () => {
      try {
        const token = await getAccessToken();
        const res = await apiFetch(`/tags/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        setProjectTags(await res.json());
      } catch (err) {
        console.error("Error cargando etiquetas:", err);
      }
    })();
  }, [task]);

  // ---------------------------------------------------------
  // 5) CARGA DE ETIQUETAS ASIGNADAS A LA TAREA
  // ---------------------------------------------------------
  useEffect(() => {
    if (!taskId) return;

    (async () => {
      try {
        const token = await getAccessToken();
        const res = await apiFetch(`/tags/task/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        const normalized =
          Array.isArray(data) && data.length > 0 && data[0].tag
            ? data.map((t: any) => t.tag)
            : data;

        // ✅ Proteger spread sobre prev=null
        setTask((prev: any) => {
          const base = prev || {};
          return { ...base, tags: normalized };
        });
      } catch (err) {
        console.error("Error cargando etiquetas de la tarea:", err);
      }
    })();
  }, [taskId]);

  // ---------------------------------------------------------
  // 6) FUNCIONES DE ETIQUETAS
  // ---------------------------------------------------------

  const assignTagToTask = async (tagId: number) => {
    if (!taskId) return;
    try {
      const token = await getAccessToken();

      const res = await apiFetch(`/tags/assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId: Number(taskId), tagId }),
      });

      if (!res.ok) throw new Error(await res.text());

      const selected = projectTags.find((t) => t.id === tagId);

      // ✅ Proteger prev=null y prev.tags undefined
      setTask((prev: any) => {
        const base = prev || {};
        const prevTags = Array.isArray(base.tags) ? base.tags : [];
        return {
          ...base,
          tags: selected ? [...prevTags, selected] : prevTags,
        };
      });

      setSelectedTag(selected);
      setShowTagPicker(false);
    } catch (err) {
      console.error("Error asignando etiqueta:", err);
      Alert.alert("Error", "No se pudo asignar etiqueta");
    }
  };

  const removeTagFromTask = async (tagId?: number) => {
    if (!taskId || !tagId) return;

    Alert.alert("Quitar etiqueta", "¿Deseas eliminar esta etiqueta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getAccessToken();

            const res = await apiFetch(`/tags/remove/${taskId}/${tagId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error(await res.text());

            // ✅ Proteger prev=null y prev.tags undefined
            setTask((prev: any) => {
              const base = prev || {};
              const prevTags = Array.isArray(base.tags) ? base.tags : [];
              return {
                ...base,
                tags: prevTags.filter((t: any) => t.id !== tagId),
              };
            });
          } catch (err) {
            console.error("Error eliminando etiqueta:", err);
            Alert.alert("Error", "No se pudo eliminar etiqueta.");
          }
        },
      },
    ]);
  };

  // ---------------------------------------------------------
  // 7) CARGA INICIAL DE LA TAREA
  // ---------------------------------------------------------
  useEffect(() => {
    if (!taskDataParam) return;

    setLoading(true);

    try {
      const parsedTask = JSON.parse(taskDataParam);

      const correctedTask = {
        ...parsedTask,
        title: parsedTask.tile || parsedTask.title,
        status: parsedTask._status || parsedTask.status,
        assigneeId: parsedTask.assigneeld || parsedTask.assigneeId,
      };

      setTask(correctedTask);

      setEditState({
        title: correctedTask.title,
        description: correctedTask.description,
        status: correctedTask.status,
        priority: correctedTask.priority,
        dueDate: correctedTask.dueDate,
        assigneeId: correctedTask.assigneeId,
      });

      // ✅ Pasar projectId explícito para no depender de task aún
      const initialId = correctedTask?.id ?? taskId;
      const projectIdFromTask = correctedTask.projectId ?? correctedTask.project?.id;
      loadAttachments(initialId, projectIdFromTask);
    } catch (e: any) {
      console.error("detail fetch error", e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [taskDataParam]);

  // ---------------------------------------------------------
  // 8) SINCRONIZACIÓN CON KANBAN
  // ---------------------------------------------------------
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(TASK_UPDATED, ({ task: updated }: any) => {
      if (updated && Number(updated.id) === Number(taskId)) {
        setTask((prev: any) => {
          const base = prev || {};
          return { ...base, status: updated.status };
        });
        setEditState((prev: any) => ({ ...(prev ?? {}), status: updated.status }));
      }
    });

    return () => sub.remove();
  }, [taskId]);

  // ---------------------------------------------------------
  // 9) FUNCIONES PARA ARCHIVOS
  // ---------------------------------------------------------

  const loadAttachments = async (
    id?: string | number,
    projectIdParam?: number | string | null
  ) => {
    const targetId = id ?? taskId;
    const projectId = projectIdParam ?? task?.projectId ?? task?.project?.id;
    if (!targetId || !projectId) return;

    try {
      const res = await apiFetch(`/attachments/projects/${projectId}/tasks/${targetId}`);
      if (res.ok) {
        const attachments = await res.json();
        // ✅ Proteger prev=null
        setTask((prev: any) => {
          const base = prev || {};
          return { ...base, attachments };
        });
      }
    } catch (err) {
      console.error("Error loading attachments:", err);
    }
  };

  const apiFetchWithFormData = async (url: string, options: any = {}) => {
    const token = await getAccessToken();
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    if (options.body instanceof FormData) delete headers["Content-Type"];
    return apiFetch(url, { ...options, headers });
  };

  const uploadFile = async () => {
    if (!selectedFile || !taskId || !task?.projectId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile as any);

      const res = await apiFetchWithFormData(
        `/attachments/projects/${task.projectId}/tasks/${taskId}`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error(await res.text());

      const result = await res.json();
      setTask((prev: any) => {
        const base = prev || {};
        const prevAttachments = Array.isArray(base.attachments) ? base.attachments : [];
        return {
          ...base,
          attachments: [...prevAttachments, result.attachment],
        };
      });
    } catch (err: any) {
      console.error("Upload error", err);
      Alert.alert("Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: number) => {
    if (!task?.projectId) return;

    Alert.alert(
      "Eliminar archivo",
      "¿Estás seguro de que quieres eliminar este archivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await apiFetch(
                `/attachments/projects/${task.projectId}/attachments/${attachmentId}`,
                { method: "DELETE" }
              );

              if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Error al eliminar archivo");
              }

              // ✅ Proteger prev=null y prev.attachments undefined
              setTask((prev: any) => {
                const base = prev || {};
                const prevAttachments = Array.isArray(base.attachments)
                  ? base.attachments
                  : [];
                return {
                  ...base,
                  attachments: prevAttachments.filter(
                    (a: any) => a.id !== attachmentId
                  ),
                };
              });

              Alert.alert("Éxito", "Archivo eliminado correctamente");
            } catch (err: any) {
              console.error("Delete error:", err);
              Alert.alert("Error", err.message ?? "No se pudo eliminar el archivo.");
            }
          },
        },
      ]
    );
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];

      setSelectedFile({
        name: file.name,
        uri: file.uri,
        size: file.size,
        type: file.mimeType || "application/octet-stream",
      });
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  // ---------------------------------------------------------
  // 10) ACTUALIZACIONES: estado, PATCH, guardar
  // ---------------------------------------------------------

  const emitTaskUpdated = (updated: any) => {
    DeviceEventEmitter.emit(TASK_UPDATED, { task: updated });
  };

  const updateTaskStatusOnly = async (id: string | number, newStatus: string) => {
    try {
      const projectId = task?.projectId ?? task?.project?.id;
      if (!projectId) throw new Error("Falta projectId en la tarea.");

      setTask((prev: any) => {
        const base = prev || {};
        return { ...base, status: newStatus };
      });

      const res = await apiFetch(`/tasks/${projectId}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      const serverTask = JSON.parse(text);
      setTask(serverTask);

      emitTaskUpdated(serverTask);
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
  };

  const persistTaskPatch = async (id: string | number, patch: Partial<any>) => {
    try {
      const projectId = task?.projectId ?? task?.project?.id;
      if (!projectId) throw new Error("Falta projectId en la tarea.");

      const res = await apiFetch(`/tasks/projects/${projectId}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      const serverTask = JSON.parse(text);
      setTask(serverTask);

      emitTaskUpdated(serverTask);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const onPickStatus = (value: string) => {
    setShowStatusPicker(false);
    setEditing(true);
    setEditState((s: any) => ({ ...s, status: value }));

    if (taskId) {
      updateTaskStatusOnly(taskId, value).catch(() => {});
    }
  };

  const onPickPriority = (value: string) => {
    setShowPriorityPicker(false);
    setEditing(true);
    setEditState((s: any) => ({ ...s, priority: value }));

    if (taskId) {
      persistTaskPatch(taskId, { priority: value });
    }
  };

  const saveEdits = async () => {
    if (!taskId || !task) return;

    const patch: any = {};

    ["title", "description", "status", "priority", "assigneeId"].forEach((k) => {
      if (editState[k] !== task[k]) patch[k] = editState[k];
    });

    if (Object.keys(patch).length > 0) {
      if (patch.status) {
        await updateTaskStatusOnly(taskId, patch.status);
        delete patch.status;
      }

      await persistTaskPatch(taskId, patch);
    }

    setEditing(false);
  };

  // ---------------------------------------------------------
  // 11) COMENTARIOS
  // ---------------------------------------------------------
  const postComment = async () => {
    if (!taskId || !newComment.trim()) return;
    const comment = {
      id: Date.now(),
      text: newComment,
      user: "Usuario Actual",
      date: new Date().toISOString(),
    };
    setTask((t: any) => {
      const base = t || {};
      const prevComments = Array.isArray(base.comments) ? base.comments : [];
      return { ...base, comments: [...prevComments, comment] };
    });
    setNewComment("");
  };


  // ---------------------------------------------------------
  // 4) TASK TIMES - NUEVOS ESTADOS
  // ---------------------------------------------------------
  const [taskTimes, setTaskTimes] = useState<any[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [addingTime, setAddingTime] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [newTimeEntry, setNewTimeEntry] = useState({
    durationMinutes: '',
    date: new Date().toISOString(),
    description: ''
  });


  const loadTaskTimes = useCallback(async () => {
    if (!taskId || !task?.projectId) return;
    
    setLoadingTimes(true);
    try {
      const token = await getAccessToken();
      const res = await apiFetch(
        `/task-times/projects/${task.projectId}/tasks/${taskId}/times`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(await res.text());
      
      const times = await res.json();
      setTaskTimes(times);
    } catch (err) {
      console.error("Error cargando registros de tiempo:", err);
      Alert.alert("Error", "No se pudieron cargar los registros de tiempo");
    } finally {
      setLoadingTimes(false);
    }
  }, [taskId, task?.projectId]);

  // Agregar nuevo registro de tiempo
  const addTimeEntry = async (entry: { durationMinutes: string; date: string; description: string }) => {
    if (!taskId || !task?.projectId || !entry.durationMinutes) return;

    setAddingTime(true);
    try {
      const token = await getAccessToken();
      const res = await apiFetch(
        `/task-times/projects/${task.projectId}/tasks/${taskId}/times`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            durationMinutes: Number(entry.durationMinutes),
            date: entry.date,
            description: entry.description,
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const created = await res.json();
      
      // Agregar el nuevo registro a la lista
      setTaskTimes(prev => [created, ...prev]);
      
      Alert.alert("Éxito", "Tiempo registrado correctamente");
      return true; // Indicar éxito
    } catch (err: any) {
      console.error("Error agregando tiempo:", err);
      Alert.alert("Error", err.message || "No se pudo registrar el tiempo");
      return false; // Indicar error
    } finally {
      setAddingTime(false);
    }
  };

  // Eliminar registro de tiempo
  const deleteTimeEntry = async (timeId: number) => {
    if (!task?.projectId) return;

    Alert.alert(
      "Eliminar registro",
      "¿Estás seguro de que quieres eliminar este registro de tiempo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getAccessToken();
              const res = await apiFetch(
                `/task-times/projects/${task.projectId}/times/${timeId}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (!res.ok) throw new Error(await res.text());

              // Remover el registro de la lista
              setTaskTimes(prev => prev.filter(time => time.id !== timeId));
              
              Alert.alert("Éxito", "Registro eliminado correctamente");
            } catch (err: any) {
              console.error("Error eliminando registro:", err);
              Alert.alert("Error", err.message || "No se pudo eliminar el registro");
            }
          },
        },
      ]
    );
  };

  // Calcular tiempo total
  const getTotalTime = () => {
    return taskTimes.reduce((total, time) => total + (time.durationMinutes || 0), 0);
  };

  // Formatear minutos a horas y minutos
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };


  // ---------------------------------------------------------
  // 12) RETORNO DEL HOOK
  // ---------------------------------------------------------

  return {
    task,
    loading,
    error,
    editing,
    editState,
    setEditState,
    setEditing,

    STATUS_OPTIONS,
    PRIORITY_OPTIONS,

    showStatusPicker,
    showPriorityPicker,
    setShowStatusPicker,
    setShowPriorityPicker,

    assignModalVisible,
    setAssignModalVisible,
    projectMembers,
    setProjectMembers,
    deleteAttachment,

    projectTags,
    showTagPicker,
    setShowTagPicker,
    selectedTag,
    assignTagToTask,
    removeTagFromTask,
    pickDocument,
    attachModalVisible,
    setAttachModalVisible,
    selectedFile,
    setSelectedFile,
    uploading,
    uploadFile,

    currentFileUrl,
    currentFileName,
    pdfViewerVisible,
    imageViewerVisible,
    setPdfViewerVisible,
    setImageViewerVisible,

    newComment,
    setNewComment,
    postComment,
    
    dueDateEditingValue,
    setDueDateEditingValue,
    onPickStatus,
    onPickPriority,
    loadAttachments,
    updateTaskStatusOnly,
    persistTaskPatch,
    saveEdits,

    taskTimes,
    loadingTimes,
    addingTime,
    timeModalVisible,
    setTimeModalVisible,
    newTimeEntry,
    setNewTimeEntry,
    addTimeEntry,
    deleteTimeEntry,
    getTotalTime,
    formatMinutes,
    loadTaskTimes,
  };
}
