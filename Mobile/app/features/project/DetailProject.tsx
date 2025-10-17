import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { API_URL } from "@/constants/api";
import { getAccessToken } from "@/lib/secure-store";
import { apiFetch } from "@/lib/api-fetch";

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

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [project, setProject] = React.useState<ProjectDetail | null>(null);
  const [owner, setOwner] = React.useState<Owner | null>(null);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [taskMetrics, setTaskMetrics] = React.useState<TaskMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = React.useState(false);

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
    
    // Siempre es "creada"
    const created = true;
    
    // "En progreso" si no ha pasado la fecha límite o no tiene fecha
    const inProgress = !dueDate || dueDate > now;
    
    // "Completada" si ya pasó la fecha límite
    const completed = dueDate && dueDate <= now;
    
    return { created, inProgress, completed };
  };

  // FUNCIÓN QUE USA TASKSCREEN PARA OBTENER TAREAS
  const fetchProjectTasks = async (projectId: number) => {
    try {
      console.log("🔍 Buscando tareas para proyecto:", projectId);
      
      // ESTE ES EL ENDPOINT QUE USA TASKSCREEN - según los logs
      const tasksRes = await apiFetch(`/tasks/projects/${projectId}/tasks`);
      
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        console.log("✅ Tareas obtenidas del endpoint de TaskScreen:", tasksData);
        
        let tasks: Task[] = [];
        
        if (Array.isArray(tasksData)) {
          tasks = tasksData;
        } else if (tasksData && typeof tasksData === 'object') {
          tasks = [tasksData];
        }
        
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

  // Función para cargar las métricas de tareas - USANDO LA MISMA LÓGICA QUE TASKSCREEN
  const fetchTaskMetrics = async (projectId: number) => {
    if (!projectId) return;
    
    setMetricsLoading(true);
    try {
      console.log("📊 Cargando métricas para proyecto:", projectId);
      
      // Obtener tareas usando el MISMO endpoint que TaskScreen
      const projectTasks = await fetchProjectTasks(projectId);
      
      console.log("📋 Tareas obtenidas para métricas:", projectTasks.length);

      // Calcular métricas
      const metrics: TaskMetrics = {
        totalTasks: projectTasks.length,
        tasksByStatus: {
          created: 0,
          in_progress: 0,
          completed: 0
        },
        tasksByMember: []
      };
      
      // Contar por estado usando la MISMA lógica de fechas que TaskScreen
      projectTasks.forEach((task: Task) => {
        const status = getTaskStatus(task);
        
        // Siempre contar como creada
        metrics.tasksByStatus.created++;
        
        // Contar en progreso y completadas según fechas
        if (status.inProgress) {
          metrics.tasksByStatus.in_progress++;
        }
        if (status.completed) {
          metrics.tasksByStatus.completed++;
        }
      });
      
      // Contar por miembro
      const memberTaskCounts: { [key: number]: { count: number, name: string } } = {};
      
      projectTasks.forEach((task: Task) => {
        const assigneeId = task.assigneeId || task.assigneeld || (task.assignee ? task.assignee.id : null);
        const assigneeName = task.assignee?.name || 'Sin asignar';
        const effectiveAssigneeId = assigneeId || 0; // 0 para "Sin asignar"
        
        if (!memberTaskCounts[effectiveAssigneeId]) {
          memberTaskCounts[effectiveAssigneeId] = {
            count: 0,
            name: assigneeName
          };
        }
        memberTaskCounts[effectiveAssigneeId].count++;
      });
      
      // Convertir a array
      metrics.tasksByMember = Object.entries(memberTaskCounts).map(([memberId, data]) => ({
        memberId: Number(memberId),
        memberName: data.name,
        taskCount: data.count
      }));
      
      console.log("📈 Métricas calculadas:", metrics);
      setTaskMetrics(metrics);
      
    } catch (error) {
      console.error("❌ Error cargando métricas:", error);
      // En caso de error, mostrar métricas vacías
      setTaskMetrics({
        totalTasks: 0,
        tasksByStatus: {
          created: 0,
          in_progress: 0,
          completed: 0
        },
        tasksByMember: []
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
      const projRes = await apiFetch(`/projects/${projectId}`, { 
        method: 'GET'
      });
      
      console.log("📊 Respuesta HTTP:", projRes.status, projRes.statusText);
      
      if (projRes.status === 500) {
        throw new Error("Error del servidor 500");
      }
      
      if (!projRes.ok) {
        const errorText = await projRes.text();
        console.error("❌ Error en respuesta:", errorText);
        throw new Error(`Error ${projRes.status}: ${projRes.statusText}`);
      }

      const projData = await projRes.json();
      console.log("✅ Datos del proyecto recibidos:", projData);
      
      // Validar estructura básica del proyecto
      if (!projData || typeof projData !== 'object') {
        throw new Error("Estructura de datos inválida");
      }
      
      if (!projData.id || !projData.name) {
        throw new Error("Datos del proyecto incompletos");
      }

      const projectDetail: ProjectDetail = {
        id: projData.id,
        name: projData.name,
        description: projData.description || null,
        status: projData.status,
        startDate: projData.startDate,
        endDate: projData.endDate,
        createdAt: projData.createdAt
      };

      setProject(projectDetail);

      // 2) Obtener información del usuario actual y establecer como owner y miembro
      const currentUserIdStr = await SecureStore.getItemAsync("userId");
      const currentUserId = currentUserIdStr ? Number(currentUserIdStr) : NaN;
      
      if (Number.isFinite(currentUserId)) {
        await setupCurrentUserAsOwnerAndMember(currentUserId);
      }

      // 3) Cargar métricas de tareas usando el MISMO endpoint que TaskScreen
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

  // Función para establecer al usuario actual como owner y miembro (fallback)
  const setupCurrentUserAsOwnerAndMember = async (userId: number) => {
    try {
      const userName = await SecureStore.getItemAsync("userName");
      const userEmail = await SecureStore.getItemAsync("userEmail");
      
      // Establecer como owner (creador)
      const ownerInfo: Owner = {
        id: userId,
        name: userName || "Usuario",
        email: userEmail || "usuario@ejemplo.com",
        role: "admin"
      };
      setOwner(ownerInfo);
      
      // Establecer como miembro también
      const memberInfo: Member = {
        id: userId,
        name: userName || "Usuario",
        email: userEmail || "usuario@ejemplo.com",
        role: "Administrador"
      };
      setMembers([memberInfo]);
      
      console.log("✅ Usuario establecido como owner y miembro (fallback):", ownerInfo);
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

  // Función para obtener el nombre del estado
  const getStatusName = (status: string) => {
    switch (status) {
      case 'created': return 'Creadas';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completadas';
      default: return status;
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return '#666666';
      case 'in_progress': return '#FFA500';
      case 'completed': return '#1a8f2e';
      default: return '#666666';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f4f7" }}>
      {/* Contenido */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Cargando proyecto…</Text>
        </View>
      ) : error ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#e6e6e6",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#d00" }}>Error</Text>
            <Text style={{ marginTop: 8, color: "#444" }}>{error}</Text>
            <Text style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
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
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#e6e6e6",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Proyecto no encontrado</Text>
            <Text style={{ marginTop: 8, color: "#666" }}>Verifica el ID: {projectId}</Text>
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
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#e6e6e6",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700" }} numberOfLines={2}>
              {project.name}
            </Text>

            <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#666", width: 110 }}>Estado</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: (project.status || "").toLowerCase() === "active" ? "#1a8f2e" : "#8a8a8a",
                }}
              >
                {project.status ?? "—"}
              </Text>
            </View>

            {/* Creador/Owner */}
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#666", width: 110 }}>Creador</Text>
              <Text style={{ fontSize: 14, fontWeight: "600" }}>
                {owner ? `${owner.name || owner.email} (${owner.role || "Admin"})` : "No asignado"}
              </Text>
            </View>

            {/* Fechas */}
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#666", width: 110 }}>Inicio</Text>
              <Text style={{ fontSize: 14 }}>{fmtDate(project.startDate)}</Text>
            </View>
            <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#666", width: 110 }}>Fin</Text>
              <Text style={{ fontSize: 14 }}>{fmtDate(project.endDate)}</Text>
            </View>

            {/* Descripción */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 14, color: "#666", marginBottom: 6 }}>Descripción</Text>
              <Text style={{ fontSize: 15, color: "#333", lineHeight: 20 }}>
                {project.description?.trim() || "Sin descripción"}
              </Text>
            </View>
          </View>

          {/* Card de Métricas de Tareas */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#e6e6e6",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 16 }}>
              Métricas de Tareas
            </Text>

            {metricsLoading ? (
              <View style={{ alignItems: "center", padding: 20 }}>
                <ActivityIndicator size="small" />
                <Text style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
                  Cargando métricas...
                </Text>
              </View>
            ) : taskMetrics ? (
              <View>
                {/* Total de tareas */}
                <View style={{ 
                  backgroundColor: "#f8f9fa", 
                  padding: 12, 
                  borderRadius: 8, 
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#3f3df8"
                }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#333" }}>
                    Total de Tareas: {taskMetrics.totalTasks}
                  </Text>
                  {taskMetrics.totalTasks === 0 && (
                    <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      No hay tareas en este proyecto
                    </Text>
                  )}
                </View>

                {taskMetrics.totalTasks > 0 && (
                  <>
                    {/* Tareas por Estado */}
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 12 }}>
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
                            borderBottomColor: "#f0f0f0",
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
                            <Text style={{ fontSize: 14, color: "#333", flex: 1 }}>
                              {getStatusName(status)}
                            </Text>
                          </View>
                          <View style={{
                            backgroundColor: "#f8f9fa",
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 12,
                            minWidth: 40,
                            alignItems: "center"
                          }}>
                            <Text style={{ fontSize: 14, fontWeight: "700", color: "#333" }}>
                              {count}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Tareas por Miembro */}
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 12 }}>
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
                              borderBottomWidth: index === taskMetrics.tasksByMember.length - 1 ? 0 : 1,
                              borderBottomColor: "#f0f0f0",
                            }}
                          >
                            <Text style={{ fontSize: 14, color: "#333" }} numberOfLines={1}>
                              {member.memberName}
                            </Text>
                            <View style={{
                              backgroundColor: member.memberName === 'Sin asignar' ? '#ffebee' : '#e8f5e8',
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                              borderRadius: 12,
                              minWidth: 60,
                              alignItems: 'center'
                            }}>
                              <Text style={{ 
                                fontSize: 14, 
                                fontWeight: "600", 
                                color: member.memberName === 'Sin asignar' ? '#d32f2f' : '#1a8f2e' 
                              }}>
                                {member.taskCount} {member.taskCount === 1 ? 'tarea' : 'tareas'}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={{ color: "#666", fontStyle: "italic", fontSize: 14, textAlign: "center", padding: 20 }}>
                        No hay tareas asignadas a miembros
                      </Text>
                    )}
                  </>
                )}
              </View>
            ) : (
              <Text style={{ color: "#666", fontStyle: "italic", textAlign: "center", padding: 20 }}>
                No se pudieron cargar las métricas
              </Text>
            )}
          </View>

          {/* Card Miembros */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              marginTop: 8,
              borderWidth: 1,
              borderColor: "#e6e6e6",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
              Miembros del Proyecto ({members.length})
            </Text>

            {members.length === 0 ? (
              <Text style={{ color: "#666", fontStyle: "italic" }}>
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
                      borderColor: "#f0f0f0",
                      borderRadius: 8,
                      backgroundColor: "#fafafa",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flexShrink: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600" }}>
                        {member.name || `Usuario #${member.id}`}
                      </Text>
                      <Text style={{ marginTop: 2, color: "#666", fontSize: 12 }}>
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
        </ScrollView>
      )}
    </View>
  );
}