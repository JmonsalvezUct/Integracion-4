import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Task } from "../types";

// 🎨 tokens centralizados
import { useThemedColors } from "@/hooks/use-theme-color";

interface TaskCalendarProps {
  tasks: Task[];
  currentStartDate: Date;
  setCurrentStartDate: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

export function TaskCalendar({
  tasks,
  currentStartDate,
  setCurrentStartDate,
  selectedDate,
  setSelectedDate,
}: TaskCalendarProps) {
  const router = useRouter();
  const today = new Date();

  // 🎨 Colores del tema
  const {
    isDark,
    BG,
    TEXT,
    SUBTEXT,
    BRAND,
    CARD_BG,
    CARD_BORDER,
    INPUT_BG,
    INPUT_BORDER,
  } = useThemedColors();

  // Generar días del mes actual
  const getDaysInMonth = () => {
    const year = currentStartDate.getFullYear();
    const month = currentStartDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  };

  const daysInMonth = getDaysInMonth();

  // Tareas para la fecha seleccionada
  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === selectedDate.getDate() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  // ¿Un día tiene tareas?
  const hasTasks = (day: number) => {
    const date = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), day);
    return tasks.some((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentStartDate.getMonth() === today.getMonth() &&
    currentStartDate.getFullYear() === today.getFullYear();

  const isSelected = (day: number) =>
    !!selectedDate &&
    day === selectedDate.getDate() &&
    currentStartDate.getMonth() === selectedDate.getMonth() &&
    currentStartDate.getFullYear() === selectedDate.getFullYear();

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), day);
    setSelectedDate(newDate);
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

  const goToPreviousMonth = () => {
    const newDate = new Date(currentStartDate);
    newDate.setMonth(currentStartDate.getMonth() - 1);
    setCurrentStartDate(newDate);
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentStartDate);
    newDate.setMonth(currentStartDate.getMonth() + 1);
    setCurrentStartDate(newDate);
    setSelectedDate(null);
  };

  const getCurrentMonthName = () =>
    currentStartDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const tasksForSelectedDate = getTasksForSelectedDate();

  // 🎨 Defaults según tema
  const DAY_BG_DEFAULT = isDark ? "#202020" : "#f8f9fa";
  const EMPTY_CARD_BG = isDark ? "#181818" : "#f8f9fa";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: CARD_BG, borderColor: CARD_BORDER, borderWidth: 1 },
      ]}
    >
      {/* Header con navegación */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={[styles.navButton, { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, borderWidth: 1 }]}
        >
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </TouchableOpacity>

        <View style={styles.dateInfo}>
          <Text style={[styles.monthText, { color: TEXT }]}>{getCurrentMonthName()}</Text>
        </View>

        <TouchableOpacity
          onPress={goToNextMonth}
          style={[styles.navButton, { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, borderWidth: 1 }]}
        >
          <Ionicons name="chevron-forward" size={24} color={TEXT} />
        </TouchableOpacity>
      </View>

      {/* Fecha seleccionada */}
      <View
        style={[
          styles.selectedDateContainer,
          { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER },
        ]}
      >
        <Text style={[styles.selectedDateText, { color: TEXT }]}>
          {selectedDate
            ? selectedDate.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Selecciona una fecha"}
        </Text>
      </View>

      {/* Indicadores */}
      <View style={styles.indicators}>
        <View style={styles.indicator}>
          <View style={[styles.indicatorColor, { backgroundColor: BRAND }]} />
          <Text style={[styles.indicatorText, { color: SUBTEXT }]}>Con tareas</Text>
        </View>
        <View style={styles.indicator}>
          <View style={[styles.indicatorColor, { backgroundColor: "#1a8f2e" }]} />
          <Text style={[styles.indicatorText, { color: SUBTEXT }]}>Hoy</Text>
        </View>
        <View style={styles.indicator}>
          <View style={[styles.indicatorColor, { backgroundColor: "#FF6B6B" }]} />
          <Text style={[styles.indicatorText, { color: SUBTEXT }]}>Seleccionado</Text>
        </View>
      </View>

      {/* Grid de días */}
      <View style={styles.daysGrid}>
        {daysInMonth.map((day) => {
          const dayHasTasks = hasTasks(day);
          const dayIsToday = isToday(day);
          const dayIsSelected = isSelected(day);

          let backgroundColor = DAY_BG_DEFAULT;
          let textColor = TEXT;
          let borderWidth = 1;
          let borderColor = "transparent";

          if (dayIsToday) {
            backgroundColor = "#1a8f2e";
            textColor = "#fff";
            borderWidth = 2;
            borderColor = "#1a8f2e";
          } else if (dayIsSelected) {
            backgroundColor = "#FF6B6B";
            textColor = "#fff";
          } else if (dayHasTasks) {
            backgroundColor = BRAND;
            textColor = "#fff";
          }

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                { backgroundColor, borderWidth, borderColor },
              ]}
              onPress={() => handleDateSelect(day)}
            >
              <Text style={[styles.dayText, { color: textColor }]}>{day}</Text>
              {dayHasTasks && !dayIsToday && !dayIsSelected && (
                <View style={[styles.taskDot, { backgroundColor: "#fff" }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lista de tareas para la fecha seleccionada */}
      {selectedDate && (
        <View style={[styles.tasksSection, { borderTopColor: CARD_BORDER }]}>
          <View style={styles.tasksHeader}>
            <Text style={[styles.tasksTitle, { color: TEXT }]}>
              Tareas para{" "}
              {selectedDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
            </Text>
            <Text style={[styles.tasksCount, { color: SUBTEXT }]}>
              {tasksForSelectedDate.length}{" "}
              {tasksForSelectedDate.length === 1 ? "tarea" : "tareas"}
            </Text>
          </View>

          {tasksForSelectedDate.length > 0 ? (
            <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
              {tasksForSelectedDate.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskItem,
                    { backgroundColor: EMPTY_CARD_BG, borderColor: CARD_BORDER },
                  ]}
                  onPress={() => handleTaskPress(task)}
                >
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, { color: TEXT }]} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={[styles.taskDescription, { color: SUBTEXT }]} numberOfLines={2}>
                      {task.description || "Sin descripción"}
                    </Text>
                    <View style={styles.taskMeta}>
                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor:
                              task.priority === "high"
                                ? "#E74C3C"
                                : task.priority === "medium"
                                ? "#F39C12"
                                : "#27AE60",
                          },
                        ]}
                      >
                        <Text style={styles.priorityText}>
                          {task.priority === "high"
                            ? "Alta"
                            : task.priority === "medium"
                            ? "Media"
                            : "Baja"}
                        </Text>
                      </View>
                      <Text style={[styles.taskStatus, { color: SUBTEXT }]}>
                        {task.status || "Pendiente"}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={SUBTEXT} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={SUBTEXT} />
              <Text style={[styles.emptyStateText, { color: SUBTEXT }]}>
                No hay tareas para esta fecha
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: SUBTEXT }]}>
                Las tareas con fecha límite {selectedDate.toLocaleDateString("es-ES")} aparecerán aquí
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  dateInfo: { alignItems: "center" },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  selectedDateContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12,
  },
  indicator: { flexDirection: "row", alignItems: "center" },
  indicatorColor: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  indicatorText: { fontSize: 12 },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dayText: { fontWeight: "600", fontSize: 14 },
  taskDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Sección de tareas
  tasksSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    flex: 1,
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tasksTitle: { fontSize: 16, fontWeight: "700" },
  tasksCount: { fontSize: 14, fontWeight: "600" },
  tasksList: { flex: 1 },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  taskContent: { flex: 1, marginRight: 8 },
  taskTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  taskDescription: { fontSize: 12, marginBottom: 6, lineHeight: 16 },
  taskMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priorityText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  taskStatus: { fontSize: 11, fontWeight: "500" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyStateText: { fontSize: 16, marginTop: 12, marginBottom: 4 },
  emptyStateSubtext: { fontSize: 14, textAlign: "center" },
});
