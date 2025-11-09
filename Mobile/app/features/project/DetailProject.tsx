import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getAccessToken } from "@/lib/secure-store";
import { apiFetch } from "@/lib/api-fetch";
import { useThemedColors } from "@/hooks/use-theme-color";
import Loader from "@/components/ui/Loader";
import { usePermissions } from "@/app/features/invitations/hooks/usePermissions";


type ProjectDetail = {
  id: number;
  name: string;
  description?: string | null;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
};

type Owner = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
};

type Member = {
  id: number;
  name?: string;
  email?: string;
  role: string;
};

type TaskMetrics = {
  totalTasks: number;
  tasksByStatus: {
    created: number;
    in_progress: number;
    completed: number;
  };
  tasksByMember: Array<{
    memberId: number;
    memberName: string;
    taskCount: number;
  }>;
};

type Task = {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  assignee?: {
    id: number;
    name: string;
  };
  assigneeId?: number;
  assigneeld?: number;
  _status?: string;
  projectId?: number;
  tile?: string;
};

export default function DetailProject() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = id ? Number(id) : null;
  const router = useRouter();
  const { can } = usePermissions(projectId ?? undefined);


  // 🎨 tokens del tema
  const {
    isDark,
    BG,
    TEXT,
    SUBTEXT,
    CARD_BG,
    CARD_BORDER,
    MUTED_BG,
  } = useThemedColors();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [project, setProject] = React.useState<ProjectDetail | null>(null);
  const [owner, setOwner] = React.useState<Owner | null>(null);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [taskMetrics, setTaskMetrics] = React.useState<TaskMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = React.useState(false);

  // --- Gestión de etiquetas ---
  const [tags, setTags] = React.useState<{ id: number; name: string; color?: string }[]>([]);
  const [newTag, setNewTag] = React.useState("");
  const [loadingTags, setLoadingTags] = React.useState(false);
    

  React.useEffect(() => {
    if (projectId) fetchTags();
  }, [projectId]);

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
      await fetchTags(); // recargar lista
    } catch (err) {
      console.error("Error creando etiqueta:", err);
    }
  };

  // ---------- utils ----------
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  };

  // MISMA LÓGICA QUE TASKSCREEN - Función para determinar el estado basado en fechas
  const getTaskStatus = (task: any) => {
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const created = true;
    const inProgress = !dueDate || dueDate > now;
    const completed = dueDate && dueDate <= now;
    return { created, inProgress, completed };
  };

  // FUNCIÓN QUE USA TASKSCREEN PARA OBTENER TAREAS
  const fetchProjectTasks = async (projectId: number) => {
    try {
      console.log("🔍 Buscando tareas para proyecto:", projectId);
      const tasksRes = await apiFetch(`/tasks/projects/${projectId}/tasks`);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        let tasks: Task[] = [];
        if (Array.isArray(tasksData)) tasks = tasksData;
        else if (tasksData && typeof tasksData === "object") tasks = [tasksData];
        console.log(`✅ ${tasks.length} tareas procesadas para proyecto ${projectId}`);
        return tasks;
      } else {
        console.warn("❌ No se pudieron cargar las tareas del endpoint principal");
        return [];
      }
    } catch (error) {
      console.error("❌ Error cargando tareas:", error);
      return [];
    }
  };

  // Métricas
  const fetchTaskMetrics = async (projectId: number) => {
    if (!projectId) return;
    setMetricsLoading(true);
    try {
      console.log("📊 Cargando métricas para proyecto:", projectId);
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
        const assigneeId = task.assigneeId || task.assigneeld || (task.assignee ? task.assignee.id : null);
        const assigneeName = task.assignee?.name || "Sin asignar";
        const effectiveAssigneeId = assigneeId || 0;
        if (!memberTaskCounts[effectiveAssigneeId]) {
          memberTaskCounts[effectiveAssigneeId] = { count: 0, name: assigneeName };
        }
        memberTaskCounts[effectiveAssigneeId].count++;
      });
      metrics.tasksByMember = Object.entries(memberTaskCounts).map(([memberId, data]) => ({
        memberId: Number(memberId),
        memberName: data.name,
        taskCount: data.count,
      }));
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

  const fetchData = React.useCallback(async () => {
    if (!projectId) {
      setError("ID de proyecto no válido");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    console.log("🔍 Iniciando carga del proyecto ID:", projectId);

    try {
      const token = await getAccessToken();
      console.log("✅ Token obtenido:", token ? "Sí" : "No");

      // 1) Detalle del proyecto
      console.log("🌐 Llamando a:", `/projects/${projectId}`);
      const projRes = await apiFetch(`/projects/${projectId}`, { method: "GET" });
      console.log("📊 Respuesta HTTP:", projRes.status, projRes.statusText);

      if (projRes.status === 500) throw new Error("Error del servidor 500");
      if (!projRes.ok) {
        const errorText = await projRes.text();
        console.error("❌ Error en respuesta:", errorText);
        throw new Error(`Error ${projRes.status}: ${projRes.statusText}`);
      }

      const projData = await projRes.json();
      if (!projData || typeof projData !== "object") throw new Error("Estructura de datos inválida");
      if (!projData.id || !projData.name) throw new Error("Datos del proyecto incompletos");

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

      // 2) Fallback: establecer usuario como owner/miembro
      const currentUserIdStr = await SecureStore.getItemAsync("userId");
      const currentUserId = currentUserIdStr ? Number(currentUserIdStr) : NaN;
      if (Number.isFinite(currentUserId)) {
        await setupCurrentUserAsOwnerAndMember(currentUserId);
      }

      // 3) Métricas
      await fetchTaskMetrics(projectId);
    } catch (e: any) {
      console.error("💥 Error general:", e);
      const errorMessage = e?.message ?? "Error desconocido al cargar el proyecto";
      setError(errorMessage);
      setProject(null);
      setOwner(null);
      setMembers([]);
    } finally {
      setLoading(false);
      console.log("🏁 Carga completada");
    }
  }, [projectId]);

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

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // etiquetas/colores de estado (mantenemos tus colores)
  const getStatusName = (status: string) => {
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
  const getStatusColor = (status: string) => {
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

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {loading ? (
        <Loader />
      ) : error ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View
            style={{
              backgroundColor: CARD_BG,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: CARD_BORDER,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#d66" }}>Error</Text>
            <Text style={{ marginTop: 8, color: TEXT }}>{error}</Text>
            <Text style={{ marginTop: 8, fontSize: 12, color: SUBTEXT }}>
              ID del proyecto: {projectId}
            </Text>
          </View>

          
        </ScrollView>
      ) : !project ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View
            style={{
              backgroundColor: CARD_BG,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: CARD_BORDER,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT }}>Proyecto no encontrado</Text>
            <Text style={{ marginTop: 8, color: SUBTEXT }}>Verifica el ID: {projectId}</Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Card principal */}
          <View
            style={{
              backgroundColor: CARD_BG,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: CARD_BORDER,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", color: TEXT }} numberOfLines={2}>
              {project.name}
            </Text>

            <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: SUBTEXT, width: 110 }}>Estado</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: (project.status || "").toLowerCase() === "active" ? "#1a8f2e" : SUBTEXT,
                }}
              >
                {project.status ?? "—"}
              </Text>
            </View>

            {/* Creador/Owner */}
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: SUBTEXT, width: 110 }}>Creador</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: TEXT }}>
                {owner ? `${owner.name || owner.email} (${owner.role || "Admin"})` : "No asignado"}
              </Text>
            </View>

            {/* Fechas */}
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: SUBTEXT, width: 110 }}>Inicio</Text>
              <Text style={{ fontSize: 14, color: TEXT }}>{fmtDate(project.startDate)}</Text>
            </View>
            <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: SUBTEXT, width: 110 }}>Fin</Text>
              <Text style={{ fontSize: 14, color: TEXT }}>{fmtDate(project.endDate)}</Text>
            </View>

            {/* Descripción */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 14, color: SUBTEXT, marginBottom: 6 }}>Descripción</Text>
              <Text style={{ fontSize: 15, color: TEXT, lineHeight: 20 }}>
                {project.description?.trim() || "Sin descripción"}
              </Text>
            </View>
          </View>

          {/* Card de Métricas de Tareas */}
          <View
            style={{
              backgroundColor: CARD_BG,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: CARD_BORDER,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 16, color: TEXT }}>
              Métricas de Tareas
            </Text>

            {metricsLoading ? (
              <View style={{ alignItems: "center", padding: 20 }}>
                <ActivityIndicator size="small" />
                <Text style={{ marginTop: 8, color: SUBTEXT, fontSize: 12 }}>
                  Cargando métricas...
                </Text>
              </View>
            ) : taskMetrics ? (
              <View>
                {/* Total de tareas */}
                <View
                  style={{
                    backgroundColor: MUTED_BG,
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: "#3f3df8",
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT }}>
                    Total de Tareas: {taskMetrics.totalTasks}
                  </Text>
                  {taskMetrics.totalTasks === 0 && (
                    <Text style={{ fontSize: 12, color: SUBTEXT, marginTop: 4 }}>
                      No hay tareas en este proyecto
                    </Text>
                  )}
                </View>

                {taskMetrics.totalTasks > 0 && (
                  <>
                    {/* Tareas por Estado */}
                    <Text style={{ fontSize: 14, fontWeight: "600", color: SUBTEXT, marginBottom: 12 }}>
                      Distribución por Estado:
                    </Text>
                    <View style={{ marginBottom: 20 }}>
                      {Object.entries(taskMetrics.tasksByStatus).map(([status, count]) => (
                        <View
                          key={status}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingVertical: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: isDark ? "#222" : "#f0f0f0",
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: getStatusColor(status),
                                marginRight: 12,
                              }}
                            />
                            <Text style={{ fontSize: 14, color: TEXT, flex: 1 }}>
                              {getStatusName(status)}
                            </Text>
                          </View>
                          <View
                            style={{
                              backgroundColor: MUTED_BG,
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                              borderRadius: 12,
                              minWidth: 40,
                              alignItems: "center",
                            }}
                          >
                            <Text style={{ fontSize: 14, fontWeight: "700", color: TEXT }}>
                              {count}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Tareas por Miembro */}
                    <Text style={{ fontSize: 14, fontWeight: "600", color: SUBTEXT, marginBottom: 12 }}>
                      Tareas por Miembro:
                    </Text>
                    {taskMetrics.tasksByMember.length > 0 ? (
                      <View>
                        {taskMetrics.tasksByMember.map((member, index) => (
                          <View
                            key={member.memberId}
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              paddingVertical: 10,
                              borderBottomWidth:
                                index === taskMetrics.tasksByMember.length - 1 ? 0 : 1,
                              borderBottomColor: isDark ? "#222" : "#f0f0f0",
                            }}
                          >
                            <Text style={{ fontSize: 14, color: TEXT }} numberOfLines={1}>
                              {member.memberName}
                            </Text>
                            <View
                              style={{
                                backgroundColor:
                                  member.memberName === "Sin asignar"
                                    ? isDark
                                      ? "#3a1e20"
                                      : "#ffebee"
                                    : isDark
                                    ? "#1f3323"
                                    : "#e8f5e8",
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderRadius: 12,
                                minWidth: 60,
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color:
                                    member.memberName === "Sin asignar"
                                      ? isDark
                                        ? "#ffb0b7"
                                        : "#d32f2f"
                                      : isDark
                                      ? "#9be7a4"
                                      : "#1a8f2e",
                                }}
                              >
                                {member.taskCount} {member.taskCount === 1 ? "tarea" : "tareas"}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text
                        style={{
                          color: SUBTEXT,
                          fontStyle: "italic",
                          fontSize: 14,
                          textAlign: "center",
                          padding: 20,
                        }}
                      >
                        No hay tareas asignadas a miembros
                      </Text>
                    )}
                  </>
                )}
              </View>
            ) : (
              <Text style={{ color: SUBTEXT, fontStyle: "italic", textAlign: "center", padding: 20 }}>
                No se pudieron cargar las métricas
              </Text>
            )}
          </View>

          {/* Card Miembros */}
          <View
            style={{
              backgroundColor: CARD_BG,
              borderRadius: 16,
              padding: 16,
              marginTop: 8,
              borderWidth: 1,
              borderColor: CARD_BORDER,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12, color: TEXT }}>
              Miembros del Proyecto ({members.length})
            </Text>

            {members.length === 0 ? (
              <Text style={{ color: SUBTEXT, fontStyle: "italic" }}>
                No hay miembros en este proyecto.
              </Text>
            ) : (
              <View style={{ gap: 8 }}>
                {members.map((member, index) => (
                  <View
                    key={member.id || index}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderColor: isDark ? "#2a2a2a" : "#f0f0f0",
                      borderRadius: 8,
                      backgroundColor: isDark ? "#222" : "#fafafa",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flexShrink: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: TEXT }}>
                        {member.name || `Usuario #${member.id}`}
                      </Text>
                      <Text style={{ marginTop: 2, color: SUBTEXT, fontSize: 12 }}>
                        {member.email || "Sin email"}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        backgroundColor: member.role === "Administrador" ? "#3f3df8" : "#666",
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "600", color: "white" }}>
                        {member.role}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>



        <View
          style={{
            backgroundColor: CARD_BG,
            borderRadius: 16,
            padding: 16,
            marginTop: 12,
            borderWidth: 1,
            borderColor: CARD_BORDER,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12, color: TEXT }}>
            Etiquetas del Proyecto ({tags.length})
          </Text>

          {/* Campo para crear nueva etiqueta */}
        {can("project", "manageTags") && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <TextInput
              placeholder="Nueva etiqueta"
              placeholderTextColor={SUBTEXT}
              value={newTag}
              onChangeText={setNewTag}
              style={{
                flex: 1,
                backgroundColor: CARD_BG,
                borderWidth: 1,
                borderColor: CARD_BORDER,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                color: TEXT,
              }}
            />

            <TouchableOpacity
              onPress={handleCreateTag}
              style={{
                marginLeft: 8,
                backgroundColor: "#3f3df8",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Agregar</Text>
            </TouchableOpacity>
          </View>
        )}


          {/* Lista de etiquetas */}
          {loadingTags ? (
            <ActivityIndicator size="small" color="#888" />
          ) : tags.length === 0 ? (
            <Text style={{ color: SUBTEXT, fontStyle: "italic" }}>
              No hay etiquetas en este proyecto.
            </Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {tags.map((tag) => (
                <View
                  key={tag.id}
                  style={{
                    borderWidth: 1,
                    borderColor: "#3f3df8",
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: "#3f3df820",
                  }}
                >
                  <Text style={{ color: "#3f3df8", fontWeight: "600" }}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        </ScrollView>
      )}
    </View>
  );
}
