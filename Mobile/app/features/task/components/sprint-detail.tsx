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
    import { useTasks } from "../hooks/usetask";
    import { DeviceEventEmitter } from "react-native";

    export default function SprintDetailScreen() {
    const { projectId, sprintId } = useLocalSearchParams();
    const router = useRouter();

    const [sprint, setSprint] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);


    const { tasks, fetchTasks } = useTasks(Number(projectId));


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



    const handleToggleTask = async (task: any) => {
        Alert.alert(
        "Confirmar",
        task.sprintId === Number(sprintId)
            ? `¿Deseas quitar "${task.title}" de este sprint?`
            : `¿Deseas asignar "${task.title}" a este sprint?`,
        [
            { text: "Cancelar", style: "cancel" },
            {
            text: "Sí",
            onPress: async () => {
                setAssigning(true);
                try {
                const body = {
                    sprintId: task.sprintId === Number(sprintId) ? null : Number(sprintId),
                };
                await apiFetch(`/tasks/${task.id}/assign-sprint`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                await fetchTasks(); 
                Alert.alert("Éxito", "La tarea fue actualizada correctamente.");
                } catch (error) {
                console.error("Error al asignar sprint:", error);
                Alert.alert("Error", "No se pudo actualizar la tarea.");
                } finally {
                setAssigning(false);
                }
            },
            },
        ]
        );
    };

    if (loading)
        return <ActivityIndicator size="large" color="#3B34FF" style={{ marginTop: 50 }} />;

    return (
        <View style={styles.container}>
        {/* 🔹 Volver */}
        <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        {/* 🔹 Información del sprint */}
        <Text style={styles.title}>{sprint.name}</Text>
        <Text style={styles.desc}>{sprint.description || "Sin descripción"}</Text>
        <Text style={styles.date}>
            📅 {new Date(sprint.startDate).toLocaleDateString()} →{" "}
            {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "En curso"}
        </Text>

        {/* 🔹 Botones de acción del sprint */}
        <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleChangeState}>
            <Text style={styles.buttonText}>
            {sprint.isActive ? "Finalizar Sprint" : "Reactivar Sprint"}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonDanger} onPress={handleDeleteSprint}>
            <Text style={styles.buttonText}>Eliminar Sprint</Text>
        </TouchableOpacity>
        </View>


        {/* 🔹 Lista de tareas */}
        <Text style={styles.subTitle}>Tareas del proyecto</Text>

        <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
            const isAssigned = item.sprintId === Number(sprintId);
            return (
                <TouchableOpacity
                onPress={() => handleToggleTask(item)}
                disabled={assigning}
                style={[
                    styles.taskCard,
                    isAssigned && { borderColor: "#3B34FF", backgroundColor: "#E8EAF6" },
                ]}
                >
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskStatus}>{item.status}</Text>
                {isAssigned && <Text style={styles.assignedTag}>Asignada a este sprint</Text>}
                </TouchableOpacity>
            );
            }}
            ListEmptyComponent={<Text style={{ color: "#999" }}>No hay tareas en este proyecto.</Text>}
        />
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FF", padding: 20 },
    backText: { color: "#3B34FF", fontWeight: "600", marginBottom: 20 },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
    desc: { color: "#666", marginBottom: 6 },
    date: { color: "#999", marginBottom: 25 },
    subTitle: { fontWeight: "700", marginBottom: 10, fontSize: 16 },
    button: {
        backgroundColor: "#3B34FF",
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: { color: "#fff", fontWeight: "600", textAlign: "center" },
    taskCard: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    taskTitle: { fontWeight: "600", color: "#1A1A1A" },
    taskStatus: { color: "#777", fontSize: 12 },
    assignedTag: {
        marginTop: 4,
        color: "#3B34FF",
        fontSize: 12,
        fontWeight: "500",
    },
        buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
    },
    buttonPrimary: {
    flex: 1,
    backgroundColor: "#3B34FF",
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



    
    });
