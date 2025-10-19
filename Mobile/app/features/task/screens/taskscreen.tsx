import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,Alert,TextInput,
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

const PRIMARY = "#3B34FF";

export function TaskScreen({ projectId }: { projectId?: string }) {
  const router = useRouter();


  if (!projectId) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>Cargando proyecto...</Text>
      </SafeAreaView>
    );
  }

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
    selectedDate,
    setSelectedDate,
    tasksForSelectedDate,
    fetchTasks,
  } = useTasks(projectId);
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

  const [viewMode, setViewMode] = useState<"list" | "calendar" | "kanban">("list");

  type ColumnKey = "status" | "assignee" | "dueDate" | "priority";
  type SortKey = "title" | "priority" | "dueDate";

  const toggleCol = (key: ColumnKey) => setColumns((c) => ({ ...c, [key]: !c[key] }));

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


  const handleTaskPress = (task: Task) => {
    console.log('🔄 Navegando a detalle con task:', task);
    
    router.push({
      pathname: "/features/task/detail_task",
      params: { 
        taskId: String(task.id),
        taskData: JSON.stringify(task)
      }
    });
  };
  const displayTasks =
    viewMode === "calendar" && selectedDate ? tasksForSelectedDate : tasks;


  const filteredTasks = React.useMemo(() => {
    if (!displayTasks || displayTasks.length === 0) return [];

    return displayTasks.filter((t) => {
      const title = (t.title ?? "").toLowerCase();
      const status = (t.status ?? "").toLowerCase();
      const assignee = (t.assignee?.name ?? "").toLowerCase();
      const dueDate = (t.dueDate ?? "").slice(0, 10);
      const tags = (t.tags ?? [])
        .map((tt) => tt.tag?.name?.toLowerCase?.() ?? "")
        .join(" ");

      const f = {
        status: filters.status.toLowerCase(),
        assignee: filters.assignee.toLowerCase(),
        dueDate: filters.dueDate,
        search: filters.search?.toLowerCase?.() ?? "",
      };

      const matchStatus = f.status ? status.includes(f.status) : true;
      const matchAssignee = f.assignee ? assignee.includes(f.assignee) : true;
      const matchDate = f.dueDate ? dueDate.startsWith(f.dueDate) : true;
      const matchSearch = f.search
        ? title.includes(f.search) || tags.includes(f.search)
        : true;

      return matchStatus && matchAssignee && matchDate && matchSearch;
    });
  }, [displayTasks, filters]);


  const nextView = () => {
    if (viewMode === "list") return setViewMode("kanban");
    if (viewMode === "kanban") return setViewMode("calendar");
    setViewMode("list");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ToastMessage
        visible={toastVisible}
        message={toastMsg}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
              {/* 🔍 Barra de búsqueda global */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#666" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tarea por título..."
            placeholderTextColor="#999"
            value={filters.search}
            onChangeText={(t: string) => setFilters({ ...filters, search: t })}

          />
          {filters.search.length > 0 && (
            <TouchableOpacity onPress={() => setFilters({ ...filters, search: "" })}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

      <View style={styles.topBar}>



        {viewMode === "list" && (
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={18} color="#fff" />
            <Text style={styles.navText}>
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.kanbanBtn} onPress={nextView}>
          <Ionicons
            name={
              viewMode === "list"
                ? "albums-outline"
                : viewMode === "kanban"
                ? "calendar-outline"
                : "list-outline"
            }
            size={20}
            color="#fff"
          />
          <Text style={styles.navText}>
            {viewMode === "list"
              ? "Kanban"
              : viewMode === "kanban"
              ? "Calendario"
              : "Lista"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Contenido principal */}
      <View style={styles.content}>
        {viewMode === "list" && (
          <>
            <TaskFilters
              filters={filters}
              setFilters={setFilters}
              columns={columns}
              toggleCol={toggleCol}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />

            {filteredTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No hay tareas en este proyecto.
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Crea la primera tarea usando el botón +
                </Text>
              </View>
            ) : (
              <TaskList
                tasks={filteredTasks}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                onAssign={(id) => {
                  setSelectedTaskId(id);
                  setAssignModalVisible(true);
                }}
                onTaskPress={handleTaskPress} 
              />
            )}
          </>
        )}

        {viewMode === "kanban" && <TaskKanban tasks={tasks} />}

        {viewMode === "calendar" && (
          <TaskCalendar
            tasks={tasks}
            currentStartDate={currentStartDate}
            setCurrentStartDate={setCurrentStartDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}
      </View>

    <TouchableOpacity
      style={styles.fab}
      onPress={async () => {
        const userId = await getUserId();

        if (!userId) {
          Alert.alert("Error", "No se encontró el ID del usuario autenticado.");
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9FB" },

  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  kanbanBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B34FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B34FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 90, 
    height: 36,
  },

  navText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },

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

  emptyState: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyStateText: { fontSize: 16, color: "#666", marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, color: "#999", textAlign: "center" },

  taskItem: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskAssignee: {
    fontSize: 12,
    color: "#3B34FF",
    fontWeight: "500",
  },
  taskStatus: {
    fontSize: 12,
    color: "#666",
  },
  searchContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  marginHorizontal: 16,
  marginTop: 10,
  marginBottom: 6,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderWidth: 1,
  borderColor: "#E0E0E0",
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
},
searchInput: {
  flex: 1,
  fontSize: 14,
  color: "#333",
  paddingVertical: 4,
},

});