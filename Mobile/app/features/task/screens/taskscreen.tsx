import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
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
    selectedDate,
    setSelectedDate,
    tasksForSelectedDate,
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

  // Obtener tareas según el modo de vista
  const displayTasks = viewMode === "calendar" && selectedDate ? tasksForSelectedDate : tasks;

  console.log("🎯 Tareas a mostrar:", displayTasks.length);
  console.log("📅 Fecha seleccionada:", selectedDate?.toLocaleDateString());
  console.log("👀 Modo de vista:", viewMode);

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
          displayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay tareas en este proyecto.</Text>
              <Text style={styles.emptyStateSubtext}>Crea la primera tarea usando el botón +</Text>
            </View>
          ) : (
            <TaskList
              tasks={displayTasks}
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
          <>
            <TaskCalendar 
              tasks={tasks} 
              currentStartDate={currentStartDate} 
              setCurrentStartDate={setCurrentStartDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />

            {/* Mostrar tareas del día seleccionado en modo calendario */}
            {selectedDate && (
              <View style={styles.selectedDateTasks}>
                <Text style={styles.selectedDateTitle}>
                  Tareas para {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                
                {tasksForSelectedDate.length === 0 ? (
                  <View style={styles.noTasks}>
                    <Text style={styles.noTasksText}>No hay tareas programadas para este día</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.tasksList}>
                    {tasksForSelectedDate.map((task) => (
                      <View key={task.id} style={styles.taskItem}>
                        <View style={styles.taskHeader}>
                          <Text style={styles.taskTitle}>{task.title}</Text>
                          <View style={[
                            styles.priorityBadge,
                            { backgroundColor: 
                              task.priority === 'high' ? '#FF6B6B' : 
                              task.priority === 'medium' ? '#FFA726' : '#4CAF50'
                            }
                          ]}>
                            <Text style={styles.priorityText}>
                              {task.priority === 'high' ? 'Alta' : 
                               task.priority === 'medium' ? 'Media' : 'Baja'}
                            </Text>
                          </View>
                        </View>
                        
                        {task.description && (
                          <Text style={styles.taskDescription} numberOfLines={2}>
                            {task.description}
                          </Text>
                        )}
                        
                        <View style={styles.taskFooter}>
                          <Text style={styles.taskAssignee}>
                            {task.assignee?.name || 'Sin asignar'}
                          </Text>
                          <Text style={styles.taskStatus}>
                            {task.status === 'completed' ? '✅ Completada' :
                             task.status === 'in_progress' ? '🔄 En progreso' : '⏳ Pendiente'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modeSelector: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginVertical: 8 
  },
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
  selectedDateTasks: {
    marginTop: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    maxHeight: 300,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: "700",
    padding: 16,
    color: "#333",
    textAlign: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  tasksList: {
    maxHeight: 250,
  },
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
  noTasks: {
    padding: 20,
    alignItems: "center",
  },
  noTasksText: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});