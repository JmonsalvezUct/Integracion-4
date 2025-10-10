    import React, { useState } from "react";
    import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import Header from "@/components/ui/header";
    import { useRouter } from "expo-router";

    import { useTasks } from "../hooks/usetask";
    import { TaskList } from "../components/tasklist";
    import { TaskCalendar } from "../components/taskcalendar";
    import { TaskFilters } from "../components/taskfilters";
    import { AssignModal } from "../components/assignmodal";
    import { ToastMessage } from "../components/toastmessage";
    import type { Task } from "../types";
    const PRIMARY = "#3B34FF";

    export default function TaskScreen() {
    const router = useRouter();
    const {
        tasks,
        projectName,
        filters,
        setFilters,
        sortBy,
        sortDirection,
        setSortBy,
        setSortDirection,
        assignTaskToUser,
        currentStartDate,
        setCurrentStartDate,
        users,
    } = useTasks();

    const [showFilters, setShowFilters] = useState(false);
    const [columns, setColumns] = useState({ status: true, assignee: true, dueDate: true, priority: true });
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

type ColumnKey = "status" | "assignee" | "dueDate" | "priority";
type SortKey = "title" | "priority" | "dueDate";

    const toggleCol = (key: ColumnKey) =>
    setColumns((c) => ({ ...c, [key]: !c[key] }));

    const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
        setSortBy(key);
        setSortDirection("asc");
    }
    };

    const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
        <Header title={`Tareas de ${projectName}`} />
        <ToastMessage visible={toastVisible} message={toastMsg} type={toastType} onHide={() => setToastVisible(false)} />

        {/* Selector de modo */}
        <View style={styles.modeSelector}>
            <TouchableOpacity
            style={[styles.modeBtn, viewMode === "list" && styles.modeBtnActive]}
            onPress={() => setViewMode("list")}
            >
            <Text style={viewMode === "list" ? styles.modeTextActive : styles.modeText}>Lista</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[styles.modeBtn, viewMode === "calendar" && styles.modeBtnActive]}
            onPress={() => setViewMode("calendar")}
            >
            <Text style={viewMode === "calendar" ? styles.modeTextActive : styles.modeText}>Calendario</Text>
            </TouchableOpacity>
        </View>

        {/* Filtros */}
        {viewMode === "list" && (
            <TaskFilters
            filters={filters}
            setFilters={setFilters}
            columns={columns}
            toggleCol={toggleCol}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            />
        )}

        {/* Contenido */}
        <View style={styles.content}>
            {viewMode === "list" ? (
            tasks.length === 0 ? (
                <Text style={{ color: "#666" }}>No hay tareas.</Text>
            ) : (
                <TaskList
                tasks={tasks}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                onAssign={(id) => {
                    setSelectedTaskId(id);
                    setAssignModalVisible(true);
                }}
                />
            )
            ) : (
            <TaskCalendar tasks={tasks} currentStartDate={currentStartDate} setCurrentStartDate={setCurrentStartDate} />
            )}
        </View>

        {/* FAB */}
        <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push({ pathname: "/features/task/CreateTask", params: { projectId: 1 } })}
        >
            <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Modal de asignación */}
        <AssignModal
            visible={assignModalVisible}
            onClose={() => setAssignModalVisible(false)}
            users={users}
            onAssign={(userId) => {
            if (selectedTaskId) {
                assignTaskToUser(selectedTaskId, userId);
                showToast("Tarea asignada correctamente");
            }
            setAssignModalVisible(false);
            }}
        />
        </SafeAreaView>
    );
    }

    const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: PRIMARY },
    content: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 28,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#5B55FF",
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
    },
    modeSelector: { flexDirection: "row", justifyContent: "center", marginVertical: 8 },
    modeBtn: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        backgroundColor: "#EFEFFF",
        borderRadius: 8,
        marginHorizontal: 4,
    },
    modeBtnActive: { backgroundColor: "#3B34FF" },
    modeText: { color: "#3B34FF", fontWeight: "600", fontSize: 14 },
    modeTextActive: { color: "#fff", fontWeight: "600", fontSize: 14 },
    });
