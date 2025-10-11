    import React, { useState } from "react";
    import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { useRouter, useLocalSearchParams } from "expo-router";
    import { useEffect } from "react";

    import DetailProject from "../project/DetailProject";

    import { TaskScreen } from "../task/screens/taskscreen"; 

    const PRIMARY = "#3B34FF";

    export default function ProjectOverview() {
    const router = useRouter();
    const params = useLocalSearchParams();
const projectId = params.projectId || params.id;

    const [activeTab, setActiveTab] = useState<"details" | "tasks">("details");
    const [projectName, setProjectName] = useState<string>(""); 
    console.log("nombre de proyecto: ", projectName)

    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
            {projectName || `Proyecto #${projectId}`}
            
            </Text>
        </View>


        {/* Tabs de navegación */}
        <View style={styles.tabs}>
            <TouchableOpacity
            style={[styles.tabBtn, activeTab === "details" && styles.tabBtnActive]}
            onPress={() => setActiveTab("details")}
            >
            <Text
                style={[
                styles.tabText,
                activeTab === "details" && styles.tabTextActive,
                ]}
            >
                Detalles
            </Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={[styles.tabBtn, activeTab === "tasks" && styles.tabBtnActive]}
            onPress={() => setActiveTab("tasks")}
            >
            <Text
                style={[
                styles.tabText,
                activeTab === "tasks" && styles.tabTextActive,
                ]}
            >
                Tareas
            </Text>
            </TouchableOpacity>
        </View>

        {/* Contenido dinámico */}
        <View style={styles.content}>
            {activeTab === "details" ? (
            <DetailProject />

            ) : (
            <TaskScreen projectId={projectId as string} />
            )}
        </View>
        </SafeAreaView>
    );
    }

    const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F9FB" },

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
    tabBtn: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
    },
    tabBtnActive: {
        borderBottomWidth: 3,
        borderBottomColor: PRIMARY,
    },
    tabText: {
        fontSize: 15,
        color: "#555",
        fontWeight: "600",
    },
    tabTextActive: { color: PRIMARY },

    content: {
        flex: 1,
        padding: 10,
    },
    });
