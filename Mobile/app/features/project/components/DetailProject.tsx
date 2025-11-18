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

import { useLocalSearchParams, useRouter } from "expo-router";

import { useThemedColors } from "@/hooks/use-theme-color";
import Loader from "@/components/ui/Loader";
import { usePermissions } from "@/app/features/invitations/hooks/usePermissions";
import { useProjectDetail } from "@/app/features/project/hooks/useProjectDetail";

import { fmtDate, getStatusName, getStatusColor } from "../utils/utilsProject";


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


const {
  loading,
  refreshing,
  error,
  project,
  owner,
  members,
  taskMetrics,
  metricsLoading,
  tags,
  loadingTags,
  newTag,
  setNewTag,
  handleCreateTag,
  onRefresh,
} = useProjectDetail(projectId);


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