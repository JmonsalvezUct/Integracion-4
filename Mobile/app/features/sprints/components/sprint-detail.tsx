    import React, { useEffect, useState } from "react";
    import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    FlatList,
    StyleSheet,
    } from "react-native";
    import { useLocalSearchParams, useRouter } from "expo-router";
    import { apiFetch } from "@/lib/api-fetch";
    import { useTasks } from "../../task/hooks/usetask";
    import { DeviceEventEmitter } from "react-native";
    import { useThemedColors } from '@/hooks/use-theme-color';
    export default function SprintDetailScreen() {
    const { projectId, sprintId } = useLocalSearchParams();
    const router = useRouter();
    const [sprint, setSprint] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);


    const { tasks, fetchTasks } = useTasks(Number(projectId));

    const {
        isDark,
        BG,
        TEXT,
        SUBTEXT,
        BRAND,
        CARD_BG,
        CARD_BORDER,
        INPUT_BORDER,
        MUTED_BG,
        PLACEHOLDER,
    } = useThemedColors();


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
        const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchSprint(), fetchTasks()]);
        setLoading(false);
        };
        loadData();
    }, []);


    const handleChangeState = async () => {
        Alert.alert(
        "Confirmar cambio de estado",
        `¿Deseas ${sprint.isActive ? "finalizar" : "reactivar"} este sprint?`,
        [
            { text: "Cancelar", style: "cancel" },
            {
            text: "Sí, cambiar",
            onPress: async () => {
                try {
                await apiFetch(`/projects/${projectId}/sprints/${sprintId}/finalize`, {
                    method: "PATCH",
                });
                Alert.alert("Éxito", "El estado del sprint se actualizó.");
                fetchSprint();
                } catch {
                Alert.alert("Error", "No se pudo cambiar el estado del sprint.");
                }
            },
            },
        ]
        );
    };

    const handleDeleteSprint = async () => {
    Alert.alert(
        "Confirmar eliminación",
        "¿Seguro que deseas eliminar este sprint? Esta acción no se puede deshacer.",
        [
        { text: "Cancelar", style: "cancel" },
        {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
            try {
                const res = await apiFetch(`/projects/${projectId}/sprints/${sprintId}`, {
                method: "DELETE",
                });
                if (!res.ok) throw new Error("Error al eliminar sprint");


                DeviceEventEmitter.emit("SPRINT_UPDATED");

                Alert.alert("Éxito", "El sprint fue eliminado correctamente.");
                router.back(); 
            } catch (err) {
                console.error("Error eliminando sprint:", err);
                Alert.alert("Error", "No se pudo eliminar el sprint.");
            }
            },
        },
        ]
    );
    };




    if (loading)
        return <ActivityIndicator size="large" color="#3B34FF" style={{ marginTop: 50 }} />;

    return (
    <View style={[styles.container, { backgroundColor: BG }]}>

    <TouchableOpacity onPress={() => router.back()}>
    <Text style={{ color: BRAND, fontWeight: "600", marginBottom: 20 }}>
        ← Volver
    </Text>
    </TouchableOpacity>

    <Text style={[styles.title, { color: TEXT }]}>{sprint.name}</Text>
    <Text style={[styles.desc, { color: SUBTEXT }]}>
    {sprint.description || "Sin descripción"}
    </Text>

    <Text style={[styles.date, { color: SUBTEXT }]}>
    {new Date(sprint.startDate).toLocaleDateString()} →
    {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "En curso"}
    </Text>


        {/* 🔹 Botones de acción del sprint */}
        <View style={styles.buttonGroup}>
        <TouchableOpacity
        style={[styles.buttonPrimary, { backgroundColor: BRAND }]}
        onPress={handleChangeState}
        >
        <Text style={styles.buttonText}>
            {sprint.isActive ? "Finalizar Sprint" : "Reactivar Sprint"}
        </Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={[styles.buttonDanger]}
        onPress={handleDeleteSprint}
        >
        <Text style={styles.buttonText}>Eliminar Sprint</Text>
        </TouchableOpacity>

        </View>


        {/* 🔹 Lista de tareas */}
        <Text style={{ color: SUBTEXT }}>Tareas del proyecto</Text>

        <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
            const isAssigned = item.sprintId === Number(sprintId);
            return (
            <TouchableOpacity
            style={[
                styles.taskCard,
                {
                backgroundColor: CARD_BG,
                borderColor: CARD_BORDER,
                },
                isAssigned && {
                borderColor: BRAND,
                backgroundColor: isDark ? "#2A2A55" : "#E8EAF6",
                },
            ]}
            >
            <Text style={[styles.taskTitle, { color: TEXT }]}>{item.title}</Text>
            <Text style={[styles.taskStatus, { color: SUBTEXT }]}>{item.status}</Text>

            {isAssigned && (
                <Text style={{ color: BRAND, fontWeight: "500", marginTop: 4 }}>
                Asignada a este sprint
                </Text>
            )}
            </TouchableOpacity>

            );
            }}
            ListEmptyComponent={<Text style={{ color: "#999" }}>No hay tareas en este proyecto.</Text>}
        />
        </View>
    );
    }

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },

  desc: {
    marginBottom: 6,
  },

  date: {
    marginBottom: 25,
  },

  subTitle: {
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 16,
  },

  taskCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },

  taskTitle: {
    fontWeight: "600",
  },

  taskStatus: {
    fontSize: 12,
  },

  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },

  buttonPrimary: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonDanger: {
    flex: 1,
    backgroundColor: "#FF4D4D",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
