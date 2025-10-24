import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Vibration } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Task } from "../types";

interface TaskCalendarProps {
  tasks: Task[];
  currentStartDate: Date;
  setCurrentStartDate: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  onTaskDateUpdate?: (taskId: number, newDate: Date) => void;
}

export function TaskCalendar({
  tasks,
  currentStartDate,
  setCurrentStartDate,
  selectedDate,
  setSelectedDate,
  onTaskDateUpdate,
}: TaskCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  // DEBUG: Verificar si la prop llega
  console.log("🎯 TaskCalendar - onTaskDateUpdate disponible:", !!onTaskDateUpdate);

  // Generar días del mes actual
  const getDaysInMonth = () => {
    const year = currentStartDate.getFullYear();
    const month = currentStartDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  };

  const daysInMonth = getDaysInMonth();

  // Obtener tareas para la fecha seleccionada
  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      try {
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getDate() === selectedDate.getDate() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getFullYear() === selectedDate.getFullYear()
        );
      } catch (error) {
        return false;
      }
    });
  };

  // Verificar si un día tiene tareas
  const hasTasks = (day: number) => {
    const date = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), day);
    return tasks.some(task => {
      if (!task.dueDate) return false;
      try {
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      } catch (error) {
        return false;
      }
    });
  };

  // Verificar si un día es hoy
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentStartDate.getMonth() === today.getMonth() &&
      currentStartDate.getFullYear() === today.getFullYear()
    );
  };

  // Verificar si un día está seleccionado
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentStartDate.getMonth() === selectedDate.getMonth() &&
      currentStartDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  // FUNCIONES DRAG & DROP
  const handleTaskLongPress = (task: Task) => {
    console.log("🧩 Iniciando drag de tarea:", task.title);
    Vibration.vibrate(50);
    setDraggingTask(task);
  };

  const handleTaskPress = (task: Task) => {
    if (draggingTask) return;
    router.push({
      pathname: "/features/task/detail_task",
      params: { 
        taskId: String(task.id),
        taskData: JSON.stringify(task)
      }
    });
  };

  const handleDayPressForDrop = async (day: number) => {
    if (!draggingTask) {
      handleDateSelect(day);
      return;
    }

    const newDate = new Date(
      currentStartDate.getFullYear(),
      currentStartDate.getMonth(),
      day
    );

    console.log(`🧩 Moviendo tarea "${draggingTask.title}" a día ${day}`);

    // SI onTaskDateUpdate existe, lo usamos
    if (onTaskDateUpdate) {
      try {
        await onTaskDateUpdate(draggingTask.id, newDate);
        console.log("✅ Tarea movida exitosamente");
      } catch (error) {
        console.error("❌ Error moviendo tarea:", error);
      }
    } else {
      // SI NO existe, solo mostramos en consola
      console.log("📝 Tarea movida (modo demo):", {
        task: draggingTask.title,
        newDate: newDate.toLocaleDateString()
      });
    }

    setDraggingTask(null);
    setDragOverDay(null);
  };

  const handleDayDragOver = (day: number) => {
    if (draggingTask) setDragOverDay(day);
  };

  const handleDayDragLeave = () => setDragOverDay(null);
  const cancelDrag = () => {
    setDraggingTask(null);
    setDragOverDay(null);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentStartDate);
    newDate.setMonth(currentStartDate.getMonth() - 1);
    setCurrentStartDate(newDate);
    setSelectedDate(null);
    cancelDrag();
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentStartDate);
    newDate.setMonth(currentStartDate.getMonth() + 1);
    setCurrentStartDate(newDate);
    setSelectedDate(null);
    cancelDrag();
  };

  const getCurrentMonthName = () => {
    return currentStartDate.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const tasksForSelectedDate = getTasksForSelectedDate();

  // Renderizar tarea individual
  const renderTaskItem = (task: Task) => (
    <TouchableOpacity
      key={task.id}
      style={[
        styles.taskItem,
        draggingTask?.id === task.id && styles.draggingTask,
      ]}
      onLongPress={() => handleTaskLongPress(task)}
      delayLongPress={500}
      onPress={() => handleTaskPress(task)}
    >
      <View style={styles.dragHandle}>
        <Ionicons name="reorder-three-outline" size={20} color="#ccc" />
      </View>
      
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {task.description || 'Sin descripción'}
        </Text>
        <View style={styles.taskMeta}>
          {task.priority && (
            <View style={[
              styles.priorityBadge,
              { 
                backgroundColor: 
                  task.priority === 'high' ? '#E74C3C' : 
                  task.priority === 'medium' ? '#F39C12' : '#27AE60'
              }
            ]}>
              <Text style={styles.priorityText}>
                {task.priority === 'high' ? 'Alta' : 
                 task.priority === 'medium' ? 'Media' : 'Baja'}
              </Text>
            </View>
          )}
          <Text style={styles.taskStatus}>
            {task.status || 'Pendiente'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.dateInfo}>
          <Text style={styles.monthText}>
            {getCurrentMonthName()}
          </Text>
        </View>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {draggingTask && (
        <View style={styles.dragIndicator}>
          <Text style={styles.dragIndicatorText}>
            🎯 Arrastrando: "{draggingTask.title}"
          </Text>
          <Text style={styles.dragIndicatorSubtext}>
            Suelta en un día para mover la tarea
          </Text>
          <TouchableOpacity onPress={cancelDrag} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateText}>
          {selectedDate 
            ? selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : "Selecciona una fecha"
          }
        </Text>
      </View>

      <View style={styles.indicators}>
        <View style={styles.indicator}>
          <View style={[styles.indicatorColor, { backgroundColor: "#3B34FF" }]} />
          <Text style={styles.indicatorText}>Con tareas</Text>
        </View>
        <View style={styles.indicator}>
          <View style={[styles.indicatorColor, { backgroundColor: "#1a8f2e" }]} />
          <Text style={styles.indicatorText}>Hoy</Text>
        </View>
        <View style={styles.indicator}>
          <View style={[styles.indicatorColor, { backgroundColor: "#FF6B6B" }]} />
          <Text style={styles.indicatorText}>Seleccionado</Text>
        </View>
        <View style={styles.indicator}>
          <View style={[styles.indicatorColor, { backgroundColor: "#FFA500" }]} />
          <Text style={styles.indicatorText}>Drag Over</Text>
        </View>
      </View>

      <View style={styles.daysGrid}>
        {daysInMonth.map((day) => {
          const dayHasTasks = hasTasks(day);
          const dayIsToday = isToday(day);
          const dayIsSelected = isSelected(day);
          const dayIsDragOver = dragOverDay === day;

          let backgroundColor = "#f8f9fa";
          let textColor = "#666";
          
          if (dayIsDragOver) {
            backgroundColor = "#FFA500";
            textColor = "white";
          } else if (dayIsToday) {
            backgroundColor = "#1a8f2e";
            textColor = "white";
          } else if (dayIsSelected) {
            backgroundColor = "#FF6B6B";
            textColor = "white";
          } else if (dayHasTasks) {
            backgroundColor = "#3B34FF";
            textColor = "white";
          }

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton, 
                { 
                  backgroundColor,
                  borderWidth: dayIsToday ? 2 : 1,
                  borderColor: dayIsToday ? "#1a8f2e" : "transparent",
                },
                dayIsDragOver && styles.dayButtonDragOver
              ]}
              onPress={() => handleDayPressForDrop(day)}
              onPressIn={() => handleDayDragOver(day)}
              onPressOut={handleDayDragLeave}
            >
              <Text style={[styles.dayText, { color: textColor }]}>
                {day}
              </Text>
              
              {dayHasTasks && !dayIsToday && !dayIsSelected && !dayIsDragOver && (
                <View style={styles.taskDot} />
              )}

              {dayIsDragOver && (
                <View style={styles.dropIndicator}>
                  <Ionicons name="download-outline" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedDate && (
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>
              Tareas para {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </Text>
            <Text style={styles.tasksCount}>
              {tasksForSelectedDate.length} {tasksForSelectedDate.length === 1 ? 'tarea' : 'tareas'}
            </Text>
          </View>

          {tasksForSelectedDate.length > 0 ? (
            <ScrollView style={styles.tasksList}>
              {tasksForSelectedDate.map(renderTaskItem)}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No hay tareas para esta fecha
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Mantén presionado una tarea para arrastrarla a otra fecha
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
    backgroundColor: "white",
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
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  dateInfo: { 
    alignItems: "center" 
  },
  monthText: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#333",
    textTransform: 'capitalize'
  },
  dragIndicator: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  dragIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 4,
  },
  dragIndicatorSubtext: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#ff4757',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  selectedDateContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12,
  },
  indicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicatorColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  indicatorText: {
    fontSize: 12,
    color: "#666",
  },
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
  dayButtonDragOver: {
    transform: [{ scale: 1.1 }],
  },
  dayText: {
    fontWeight: "600",
    fontSize: 14,
  },
  taskDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
  },
  dropIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: '#FFA500',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksSection: {
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingTop: 16,
    flex: 1,
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  tasksCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  tasksList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  draggingTask: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandle: {
    marginRight: 12,
    padding: 4,
  },
  taskContent: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    lineHeight: 16,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  taskStatus: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});