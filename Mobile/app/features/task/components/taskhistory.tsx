    // project/task/screens/task_history.tsx
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

    const PRIMARY = "#3B34FF";

    export default function TaskHistory() {
    const { projectId, taskId } = useLocalSearchParams();
    const router = useRouter();

    const normalizedTaskId = Array.isArray(taskId) ? taskId[0] : taskId;
    const normalizedProjectId = Array.isArray(projectId) ? projectId[0] : projectId;
    const { history, loading, error } = useTaskHistory(
        normalizedProjectId,
        normalizedTaskId
    );

    return (
        <ScrollView
        style={{ flex: 1, backgroundColor: "#f8f9ff" }}
        contentContainerStyle={{ padding: 16 }}
        >
        {/* 🔹 Header */}
        <View
            style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            }}
        >
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#1a1a1a" }}>
            Historial de cambios
            </Text>

            <TouchableOpacity
            onPress={() => router.back()}
            style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: PRIMARY,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
            }}
            >
            <Ionicons name="arrow-back" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
                Volver
            </Text>
            </TouchableOpacity>
        </View>

        {/* 🔹 Loading / Error states */}
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
                color: "#777",
                fontStyle: "italic",
                textAlign: "center",
                marginTop: 40,
            }}
            >
            No hay historial registrado para esta tarea.
            </Text>
        )}

        {!loading &&
        history.map((entry, index) => {
            // ✅ Normalizar action (puede ser string u objeto)
            const getActionType = (a: unknown): string => {
            if (typeof a === "string") return a;
            if (a && typeof a === "object" && "action" in (a as any)) {
                const v = (a as any).action;
                if (typeof v === "string") return v;
            }
            return "UNKNOWN";
            };

            const actionType = getActionType((entry as any).action).toUpperCase();

            // --- 🎨 Icono, color y label según acción ---
            let icon: any = "create-outline";
            let color = "#3B34FF";
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

            // --- 🗣️ Traducciones de campos ---
            const fieldTranslations: Record<string, string> = {
            priority: "Prioridad",
            status: "Estado",
            assigneeId: "Responsable",
            dueDate: "Fecha límite",
            description: "Descripción",
            title: "Título",
            };

            // --- Traducción de valores comunes ---
            const valueTranslations: Record<string, string> = {
            high: "Alta",
            medium: "Media",
            low: "Baja",
            created: "Creado",
            in_progress: "En progreso",
            done: "Completado",
            null: "—",
            };

            // --- 🧠 Reemplazar campos y valores dentro de la descripción ---
            let translatedDescription = (entry as any).description ?? "";

            Object.entries(fieldTranslations).forEach(([key, value]) => {
            const regex = new RegExp(`\\b${key}\\b`, "gi");
            translatedDescription = translatedDescription.replace(regex, `"${value}"`);
            });

            Object.entries(valueTranslations).forEach(([key, value]) => {
            const regex = new RegExp(`\\b${key}\\b`, "gi");
            translatedDescription = translatedDescription.replace(regex, `"${value}"`);
            });

            return (
            <View
                key={(entry as any).id}
                style={{
                backgroundColor: "#fff",
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
                }}
            >
                {/* 🔹 Encabezado */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name={icon as any} size={20} color={color} />
                <Text
                    style={{
                    marginLeft: 8,
                    fontWeight: "700",
                    color: "#333",
                    textTransform: "capitalize",
                    }}
                >
                    {actionLabel}
                </Text>
                </View>

                {/* 🔹 Descripción traducida */}
                <Text style={{ color: "#444", marginTop: 6, lineHeight: 20 }}>
                {translatedDescription}
                </Text>

                {/* 🔹 Autor y fecha */}
                <Text
                style={{
                    color: "#666",
                    fontSize: 12,
                    marginTop: 6,
                    fontStyle: "italic",
                }}
                >
                Por {(entry as any).user?.name ?? "Usuario desconocido"} ·{" "}
                {new Date((entry as any).date).toLocaleString("es-CL")}
                </Text>
            </View>
            );
        })}


        </ScrollView>
    );
    }
