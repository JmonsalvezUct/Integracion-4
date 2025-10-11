
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

  // ---------- utils ----------
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
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
      
      const headers: HeadersInit = token ? { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {};

      // 1) Detalle del proyecto
      console.log("🌐 Llamando a:", `${API_URL}/projects/${projectId}`);
      const projRes = await fetch(`${API_URL}/projects/${projectId}`, { 
        headers,
        method: 'GET'
      });
      
      console.log("📊 Respuesta HTTP:", projRes.status, projRes.statusText);
      
      if (projRes.status === 500) {
        // Error del servidor - usar el endpoint de proyectos del usuario como fallback
        console.log("⚠️ Error 500 del servidor, usando proyectos del usuario...");
        
        const currentUserIdStr = await SecureStore.getItemAsync("userId");
        const currentUserId = currentUserIdStr ? Number(currentUserIdStr) : NaN;
        
        if (Number.isFinite(currentUserId)) {
          const userProjectsRes = await fetch(`${API_URL}/projects/user/${currentUserId}`, { headers });
          if (userProjectsRes.ok) {
            const userProjects = await userProjectsRes.json();
            console.log("📋 Proyectos del usuario:", userProjects);
            
            // Buscar este proyecto en la lista
            const foundProject = Array.isArray(userProjects) 
              ? userProjects.find((up: any) => up.project?.id === projectId || up.projectId === projectId)
              : null;
              
            if (foundProject && foundProject.project) {
              console.log("✅ Proyecto encontrado en lista de usuario:", foundProject.project);
              console.log("👤 Información del usuario:", foundProject.user);
              console.log("🎭 Rol del usuario:", foundProject.role);
              
              const projectDetail: ProjectDetail = {
                id: foundProject.project.id,
                name: foundProject.project.name,
                description: foundProject.project.description,
                status: foundProject.project.status,
                startDate: foundProject.project.startDate,
                endDate: foundProject.project.endDate,
                createdAt: foundProject.project.createdAt
              };
              setProject(projectDetail);
              
              // USAR LA INFORMACIÓN REAL DEL USUARIO DESDE LA RESPUESTA
              if (foundProject.user) {
                // Establecer como owner (creador)
                const ownerInfo: Owner = {
                  id: foundProject.user.id,
                  name: foundProject.user.name,
                  email: foundProject.user.email,
                  role: foundProject.role
                };
                setOwner(ownerInfo);
                
                // Establecer como miembro también
                const memberInfo: Member = {
                  id: foundProject.user.id,
                  name: foundProject.user.name,
                  email: foundProject.user.email,
                  role: foundProject.role === 'admin' ? 'Administrador' : foundProject.role
                };
                setMembers([memberInfo]);
                
                console.log("✅ Usuario establecido como owner y miembro con datos reales:", ownerInfo);
              } else {
                // Fallback si no viene user en la respuesta
                await setupCurrentUserAsOwnerAndMember(currentUserId);
              }
              
              return; // Salir temprano - éxito con fallback
            }
          }
        }
        
        // Si llegamos aquí, todos los fallbacks fallaron
        throw new Error("El servidor tiene problemas internos. Intenta más tarde.");
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

  const ownerLabel = owner?.name || owner?.email || (owner ? `Usuario #${owner.id}` : "—");

  // Función para crear un proyecto de ejemplo (solo para testing)
  const createExampleProject = () => {
    const exampleProject: ProjectDetail = {
      id: projectId || 0,
      name: "Proyecto de Ejemplo",
      description: "Este es un proyecto de ejemplo porque el servidor no está respondiendo correctamente.",
      status: "active",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    setProject(exampleProject);
    setError(null);
    
    // Establecer usuario actual como owner y miembro
    const currentUserIdStr = SecureStore.getItem("userId");
    const currentUserId = currentUserIdStr ? Number(currentUserIdStr) : 1;
    const userName = SecureStore.getItem("userName");
    const userEmail = SecureStore.getItem("userEmail");
    
    const ownerInfo: Owner = {
      id: currentUserId,
      name: userName || "Leo",
      email: userEmail || "leo@test.com",
      role: "admin"
    };
    setOwner(ownerInfo);
    
    const memberInfo: Member = {
      id: currentUserId,
      name: userName || "Leo",
      email: userEmail || "leo@test.com",
      role: "Administrador"
    };
    setMembers([memberInfo]);
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
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#d00" }}>Error del Servidor</Text>
            <Text style={{ marginTop: 8, color: "#444" }}>{error}</Text>
            <Text style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              ID del proyecto: {projectId}
            </Text>
            
            <Text style={{ marginTop: 16, fontSize: 14, color: "#666" }}>
              El servidor está experimentando problemas internos.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={onRefresh}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: "#3f3df8",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Reintentar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={createExampleProject}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: "#666",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Ver Ejemplo</Text>
              </TouchableOpacity>
            </View>
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