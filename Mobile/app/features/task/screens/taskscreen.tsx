// REEMPLAZA TODO EL taskscreen.tsx con ESTE CÓDIGO:

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView, // 👈 Importar ScrollView
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTasks } from "../hooks/usetask";
import { TaskList } from "../components/tasklist";
import { TaskCalendar } from "../components/taskcalendar";
import { TaskFilters } from "../components/taskfilters";
import { AssignModal } from "../components/assignmodal";
import { ToastMessage } from "../components/toastmessage";
import { TaskKanban } from "../components/taskkanban";
import type { Task } from "../types";
import { getUserId } from "@/lib/secure-store";
import { useFocusEffect } from "@react-navigation/native";

// 🎨 tokens de tema centralizados (de 'develop')
import { useThemedColors } from "@/hooks/use-theme-color";

export function TaskScreen({ projectId }: { projectId?: string }) {
  const router = useRouter();

  // Colores del tema (de 'develop')
  const {
    BG,
    TEXT,
    SUBTEXT,
    BRAND,
    CARD_BG,
    CARD_BORDER,
    INPUT_BG,
    INPUT_BORDER,
  } = useThemedColors();

  const {
    tasks, // Tareas filtradas y ordenadas para la LISTA
    allTasksForCalendar, // 🔥 Tareas COMPLETAS para el CALENDARIO
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
    selectedDate,
    setSelectedDate,
    tasksForSelectedDate,
    fetchTasks,
    updateTaskDate, // 🔥 Función importada de 'javier'
  } = useTasks(projectId);

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const [showFilters, setShowFilters] = useState(false);
  const [columns, setColumns] = useState({
    status: true,
    assignee: true,
    dueDate: true,
    priority: true,
  });
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [viewMode, setViewMode] = useState<"list" | "calendar" | "kanban">(
    "list"
  );

  type ColumnKey = "status" | "assignee" | "dueDate" | "priority";
  type SortKey = "title" | "priority" | "dueDate";

  const toggleCol = (key: ColumnKey) =>
    setColumns((c) => ({ ...c, [key]: !c[key] }));

  const handleSort = (key: SortKey) => {
    if (sortBy === key)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
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

  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: "/features/task/detail_task",
      params: {
        taskId: String(task.id),
        taskData: JSON.stringify(task),
      },
    });
  };

  // 🔥 ESTA ES LA FUNCIÓN CRÍTICA QUE DEBE PASARSE (de 'javier')
  const handleTaskDateUpdate = async (taskId: number, newDate: Date) => {
    console.log("🔥 TaskScreen: handleTaskDateUpdate llamado", {
      taskId,
      newDate,
    });
    try {
      await updateTaskDate(taskId, newDate);
      showToast(
        `Fecha actualizada al ${newDate.toLocaleDateString("es-ES")}`,
        "success"
      );
    } catch (error) {
      console.error("❌ Error en TaskScreen:", error);
      showToast("Error al actualizar la fecha", "error");
    }
  };

  const displayTasks =
    viewMode === "calendar" && selectedDate ? tasksForSelectedDate : tasks;

  if (!projectId) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: BG,
          },
        ]}
      >
        <Text style={{ color: TEXT, fontSize: 16 }}>Cargando proyecto...</Text>
      </SafeAreaView>
    );
  }
  const nextView = () => {
    if (viewMode === "list") return setViewMode("kanban");
    if (viewMode === "kanban") return setViewMode("calendar");
    setViewMode("list");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG }]}>
      <ToastMessage
        visible={toastVisible}
        message={toastMsg}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      {/* 🔍 Búsqueda (de 'develop') */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={SUBTEXT}
          style={{ marginRight: 6 }}
        />
        <TextInput
          style={[styles.searchInput, { color: TEXT }]}
          placeholder="Buscar tarea por título o tag..."
          placeholderTextColor={SUBTEXT}
          value={filters.search}
          onChangeText={(t: string) => setFilters({ ...filters, search: t })}
        />
        {filters.search.length > 0 && (
          <TouchableOpacity
            onPress={() => setFilters({ ...filters, search: "" })}
          >
            <Ionicons name="close-circle" size={18} color={SUBTEXT} />
          </TouchableOpacity>
        )}
      </View>

      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: CARD_BG, borderBottomColor: CARD_BORDER },
        ]}
      >
        {viewMode === "list" && (
          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: BRAND }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={18} color="#fff" />
            <Text style={styles.navText}>
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.kanbanBtn, { backgroundColor: BRAND }]}
          onPress={nextView}
        >
          <Ionicons
            name={
              viewMode === "list" ? "albums-outline" :
              viewMode === "kanban" ? "calendar-outline" : "list-outline"
            }
            size={20}
            color="#fff"
          />
          <Text style={styles.navText}>
            {viewMode === "list" ? "Kanban" :
             viewMode === "kanban" ? "Calendario" : "Lista"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      {/* ✅ ARREGLO: 
        Cambiamos 'View' por 'ScrollView' cuando viewMode es 'calendar'
        para permitir que el TaskCalendar (grid + lista) pueda escrolear.
        Quitamos el padding de 'styles.content' y lo ponemos dentro
        de las vistas de 'list' y 'kanban' para que el calendario
        pueda usar todo el ancho.
      */}
      <View style={[styles.content, { backgroundColor: CARD_BG }]}>
        {viewMode === "list" && (
          <View style={{ flex: 1, padding: 16 }}>
            <TaskFilters
              filters={filters}
              setFilters={setFilters}
              columns={columns}
              toggleCol={toggleCol}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />

            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: SUBTEXT }]}>
                  No se encontraron tareas.
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: SUBTEXT }]}>
                  Intenta ajustar los filtros o crea una nueva tarea.
                </Text>
              </View>
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
                onTaskPress={handleTaskPress}
                columns={columns}
              />
            )}
          </View>
        )}

        {viewMode === "kanban" && (
          <View style={{ flex: 1, padding: 16 }}>
            <TaskKanban tasks={allTasksForCalendar} />
          </View>
        )}

        {/* ✅ ARREGLO: Envolvemos TaskCalendar en un ScrollView */}
        {viewMode === "calendar" && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <TaskCalendar
              tasks={allTasksForCalendar}
              currentStartDate={currentStartDate}
              setCurrentStartDate={setCurrentStartDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onTaskDateUpdate={handleTaskDateUpdate}
            />
          </ScrollView>
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: BRAND }]}
        onPress={async () => {
          const userId = await getUserId();
          if (!userId) {
            Alert.alert(
              "Error",
              "No se encontró el ID del usuario autenticado."
            );
            return;
          }
          if (!projectId) {
            Alert.alert("Error", "No se encontró el ID del proyecto.");
            return;
          }
          router.push({
            pathname: "/features/task/components/CreateTask",
            params: {
              projectId: projectId.toString(),
              creatorId: userId.toString(),
            },
          });
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

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

// Estilos de 'develop'
const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  kanbanBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: "auto",
    height: 36,
  },
  navText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    // padding: 16, // <-- ✅ ARREGLO: quitamos padding de aquí
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
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },

  emptyState: { alignItems: "center", justifyContent: "center", padding: 40, flex: 1 },
  emptyStateText: { fontSize: 16, marginBottom: 8, fontWeight: "600" },
  emptyStateSubtext: { fontSize: 14, textAlign: "center" },

  // Search bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
});

