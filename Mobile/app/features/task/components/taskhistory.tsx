import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTaskHistory } from "../hooks/usetask";
import { Ionicons } from "@expo/vector-icons";

// 🎨 Hook de tema
import { useThemedColors } from "@/hooks/use-theme-color";
import LayoutContainer from "@/components/layout/layout_container";
import { CONTAINER } from "@/constants/spacing"; 

const PRIMARY = "#0a7ea4";

export default function TaskHistory() {
  const { projectId, taskId } = useLocalSearchParams();
  const router = useRouter();

  const normalizedTaskId = Array.isArray(taskId) ? taskId[0] : taskId;
  const normalizedProjectId = Array.isArray(projectId)
    ? projectId[0]
    : projectId;

  const { history, loading, error } = useTaskHistory(
    normalizedProjectId,
    normalizedTaskId
  );

  // 🎨 tokens de tema
  const { BG, CARD_BG, CARD_BORDER, TEXT, SUBTEXT } = useThemedColors();

  return (
    // ✅ LayoutContainer con fondo dinámico del tema
    <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
      <ScrollView
        // ❌ quitamos el fondo aquí para evitar el borde claro en modo oscuro
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: CONTAINER.horizontal,
          paddingTop: CONTAINER.top,
          paddingBottom: CONTAINER.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔙 Encabezado */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            marginBottom: 28,
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="arrow-back" size={20} color={PRIMARY} />
            <Text
              style={{
                color: PRIMARY,
                fontWeight: "700",
                fontSize: 16,
                marginLeft: 6,
              }}
            >
              Volver
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: TEXT,
              marginLeft: 10,
            }}
          >
            Historial de cambios
          </Text>
        </View>

        {loading && (
          <View style={{ flex: 1, alignItems: "center", marginTop: 40 }}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        )}

        {error && (
          <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>
            Error al cargar historial: {error}
          </Text>
        )}

        {!loading && !history.length && (
          <Text
            style={{
              color: SUBTEXT,
              fontStyle: "italic",
              textAlign: "center",
              marginTop: 40,
            }}
          >
            No hay historial registrado para esta tarea.
          </Text>
        )}

        {!loading &&
          history.map((entry: any) => {
            const getActionType = (a: unknown): string => {
              if (typeof a === "string") return a;
              if (a && typeof a === "object" && "action" in (a as any)) {
                const v = (a as any).action;
                if (typeof v === "string") return v;
              }
              return "UNKNOWN";
            };

            const actionType = getActionType(entry.action).toUpperCase();

            let icon: any = "create-outline";
            let color = PRIMARY;
            let actionLabel = "Cambio";

            switch (actionType) {
              case "CREATED":
                icon = "add-circle-outline";
                color = "#34D399";
                actionLabel = "Creado";
                break;
              case "UPDATED":
                icon = "refresh-outline";
                color = "#FACC15";
                actionLabel = "Actualización";
                break;
            }

            const fieldTranslations: Record<string, string> = {
              priority: "Prioridad",
              status: "Estado",
              assigneeId: "Responsable",
              dueDate: "Fecha límite",
              description: "Descripción",
              title: "Título",
            };

            const valueTranslations: Record<string, string> = {
              high: "Alta",
              medium: "Media",
              low: "Baja",
              created: "Creado",
              in_progress: "En progreso",
              done: "Completado",
              completed: "Completado",
              null: "—",
            };

            let translatedDescription = entry.description ?? "";

            Object.entries(fieldTranslations).forEach(([key, value]) => {
              const regex = new RegExp(`\\b${key}\\b`, "gi");
              translatedDescription = translatedDescription.replace(regex, `"${value}"`);
            });

            Object.entries(valueTranslations).forEach(([key, value]) => {
              const regex = new RegExp(`\\b${key}\\b`, "gi");
              translatedDescription = translatedDescription.replace(regex, `"${value}"`);
            });

            if (entry.description?.toLowerCase().includes("assigneeid")) {
              const newAssigneeName = entry.userAssigned?.name || "nuevo responsable";
              translatedDescription = `Campo "Responsable" cambiado a ${newAssigneeName}`;
            }

            return (
              <View
                key={entry.id}
                style={{
                  backgroundColor: CARD_BG,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 2,
                  borderLeftWidth: 5,
                  borderLeftColor: color,
                  borderColor: CARD_BORDER,
                  borderWidth: 1,
                }}
              >
                {/* 🔹 Encabezado */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name={icon as any} size={20} color={color} />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontWeight: "700",
                      color: TEXT,
                      textTransform: "capitalize",
                    }}
                  >
                    {actionLabel}
                  </Text>
                </View>

                
                <Text style={{ color: TEXT, marginTop: 6, lineHeight: 20 }}>
                  {translatedDescription}
                </Text>

                
                <Text
                  style={{
                    color: SUBTEXT,
                    fontSize: 12,
                    marginTop: 6,
                    fontStyle: "italic",
                  }}
                >
                  Por {entry.user?.name ?? "Usuario desconocido"} ·{" "}
                  {new Date(entry.date).toLocaleString("es-CL")}
                </Text>
              </View>
            );
          })}
      </ScrollView>
    </LayoutContainer>
  );
}
