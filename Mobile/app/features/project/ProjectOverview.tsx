    import React, { useState, useEffect } from "react";
    import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { useRouter, useLocalSearchParams } from "expo-router";
    import { getAccessToken } from "@/lib/secure-store";

    import DetailProject from "../project/DetailProject";
    import EditProject from "../project/EditProject";
    import { TaskScreen } from "../task/screens/taskscreen";
    import { apiFetch } from "@/lib/api-fetch";

    const PRIMARY = "#3B34FF";
    const API_BASE = "https://integracion-4.onrender.com";

    export default function ProjectOverview() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const projectId = params.projectId || params.id;

    const [activeTab, setActiveTab] = useState<"details" | "tasks" | "edit">("details");
    const [projectName, setProjectName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        const loadProjectName = async () => {
        try {
            const token = await getAccessToken();
            if (!token) {
            console.warn(" No hay token guardado");
            return;
            }

            const res = await apiFetch(`/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            setProjectName(data.name);
        } catch (err) {
            console.error(" Error al cargar nombre del proyecto:", err);
        } finally {
            setLoading(false);
        }
        };

        if (projectId) loadProjectName();
    }, [projectId]);

    if (loading) {
        return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY} />
        </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
        {/* 🔹 Header superior */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
            {projectName || `Proyecto #${projectId}`}
            </Text>
        </View>

        {/* 🔹 Tabs de navegación */}
        <View style={styles.tabs}>
            <TouchableOpacity
            style={[styles.tabBtn, activeTab === "details" && styles.tabBtnActive]}
            onPress={() => setActiveTab("details")}
            >
            <Text
                style={[styles.tabText, activeTab === "details" && styles.tabTextActive]}
            >
                Detalles
            </Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={[styles.tabBtn, activeTab === "tasks" && styles.tabBtnActive]}
            onPress={() => setActiveTab("tasks")}
            >
            <Text
                style={[styles.tabText, activeTab === "tasks" && styles.tabTextActive]}
            >
                Tareas
            </Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={[styles.tabBtn, activeTab === "edit" && styles.tabBtnActive]}
            onPress={() => setActiveTab("edit")}
            >
            <Text
                style={[styles.tabText, activeTab === "edit" && styles.tabTextActive]}
            >
                Editar
            </Text>
            </TouchableOpacity>
        </View>

        {/* 🔹 Contenido dinámico */}
        <View style={styles.content}>
            {activeTab === "details" && <DetailProject />}
            {activeTab === "tasks" && <TaskScreen projectId={projectId as string} />}
            {activeTab === "edit" && <EditProject projectId={projectId as string} />}
        </View>
        </SafeAreaView>
    );
    }

    const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F9FB" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: PRIMARY,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        marginRight: 12,
        backgroundColor: "#2F2A99",
        padding: 6,
        borderRadius: 8,
    },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
    tabs: {
        flexDirection: "row",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
        backgroundColor: "#fff",
    },
    tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
    tabBtnActive: { borderBottomWidth: 3, borderBottomColor: PRIMARY },
    tabText: { fontSize: 15, color: "#555", fontWeight: "600" },
    tabTextActive: { color: PRIMARY },
    content: { flex: 1, padding: 10 },
    });
