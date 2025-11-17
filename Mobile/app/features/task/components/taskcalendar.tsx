import React, { useState, useRef } from "react"; // 👈 Añadir useRef
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  PanResponder,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Task } from "../types";

// 🎨 tokens centralizados (de 'develop')
import { useThemedColors } from "@/hooks/use-theme-color";

interface TaskCalendarProps {
  tasks: Task[];
  currentStartDate: Date;
  setCurrentStartDate: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  onTaskDateUpdate?: (taskId: number, newDate: Date) => void;
}

// Constantes del grid para el cálculo
const DAY_SIZE = 40;
const DAY_GAP = 8;
const TOTAL_DAY_WIDTH = DAY_SIZE + DAY_GAP;
const TOTAL_DAY_HEIGHT = DAY_SIZE + DAY_GAP;

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

  // Estados de Drag & Drop
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // 🎨 Colores del tema
  const { isDark, TEXT, SUBTEXT, BRAND, CARD_BG, CARD_BORDER, INPUT_BG, INPUT_BORDER } =
    useThemedColors();

  // ✅ --- INICIO ARREGLO 'DROP' ---
  // Ref para el contenedor del grid de días
  const gridRef = useRef<View>(null);
  // Estado para guardar la posición y tamaño del grid en la pantalla
  const [gridLayout, setGridLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  // ✅ --- FIN ARREGLO 'DROP' ---

  // Generar días del mes actual
  const getDaysInMonth = () => {
    const year = currentStartDate.getFullYear();
    const month = currentStartDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  };

  const daysInMonth = getDaysInMonth();

  // ... (getTasksForSelectedDate, hasTasks, isToday, isSelected sin cambios) ...
  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    return tasks.filter((task) => {
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

  const hasTasks = (day: number) => {
    const date = new Date(
      currentStartDate.getFullYear(),
      currentStartDate.getMonth(),
      day
    );
    return tasks.some((task) => {
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
    const newDate = new Date(
      currentStartDate.getFullYear(),
      currentStartDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
  };

  // --- LÓGICA DRAG & DROP ---

  const startDrag = (task: Task, x: number, y: number) => {
    Vibration.vibrate(50);
    setDraggingTask(task);
    setDragPosition({ x, y });
    setIsDragging(true);

    // ✅ ARREGLO: Asegurarnos de tener la posición del grid al empezar
    gridRef.current?.measure((x, y, width, height, pageX, pageY) => {
      if (width > 0) {
        setGridLayout({ x: pageX, y: pageY, width, height });
      }
    });
  };

  const handleTaskPress = (task: Task) => {
    if (isDragging) return;
    router.push({
      pathname: "/features/task/detail_task",
      params: {
        taskId: String(task.id),
        taskData: JSON.stringify(task),
      },
    });
  };

  const handleDayDrop = async (day: number) => {
    if (!draggingTask) return;

    const newDate = new Date(
      currentStartDate.getFullYear(),
      currentStartDate.getMonth(),
      day
    );


    if (onTaskDateUpdate) {
      try {
        await onTaskDateUpdate(draggingTask.id, newDate);
      } catch (error) {
        console.error("❌ Error moviendo tarea:", error);
      }
    } else {
      console.warn("TaskCalendar: onTaskDateUpdate no fue proporcionado.");
    }

    finishDrag();
  };

  const finishDrag = () => {
    setDraggingTask(null);
    setDragOverDay(null);
    setIsDragging(false);
  };

  const cancelDrag = () => {
    finishDrag();
  };

  // ✅ --- INICIO ARREGLO 'DROP': Lógica del PanResponder mejorada ---
  const panResponder = PanResponder.create({
    // Pedir control al iniciar
    onStartShouldSetPanResponder: () => true,
    // Pedir control al mover (SOLO SI estamos arrastrando una tarea)
    onMoveShouldSetPanResponder: (evt, gestureState) => !!draggingTask,

    onPanResponderGrant: (evt, gestureState) => {
      // El 'longPress' en la tarea ya inició el drag
    },

    onPanResponderMove: (evt, gestureState) => {
      if (!draggingTask) return;

      // 1. Actualizar la posición visual de la "sombra" de la tarea
      setDragPosition({ x: gestureState.moveX, y: gestureState.moveY });

      // 2. Calcular sobre qué día estamos (Hit Detection)
      if (!gridLayout) {
        // Si no tenemos el layout del grid, no podemos calcular.
        return;
      }

      const { x: gridX, y: gridY, width: gridWidth, height: gridHeight } = gridLayout;
      const { moveX, moveY } = gestureState;

      // Comprobar si el dedo está FUERA del grid
      if (
        moveX < gridX ||
        moveX > gridX + gridWidth ||
        moveY < gridY ||
        moveY > gridY + gridHeight
      ) {
        setDragOverDay(null);
        return;
      }

      // El dedo está DENTRO del grid, calcular la fila y columna
      const relativeX = moveX - gridX;
      const relativeY = moveY - gridY;

      // (Usa las constantes DAY_SIZE y DAY_GAP definidas arriba)
      const col = Math.floor(relativeX / TOTAL_DAY_WIDTH);
      const row = Math.floor(relativeY / TOTAL_DAY_HEIGHT);

      // Asegurarse de que la columna esté entre 0 y 6
      const safeCol = Math.max(0, Math.min(col, 6));
      
      const dayIndex = row * 7 + safeCol;

      if (dayIndex >= 0 && dayIndex < daysInMonth.length) {
        const day = daysInMonth[dayIndex];
        if(day !== dragOverDay) {
          setDragOverDay(day);
        }
      } else {
        setDragOverDay(null);
      }
    },

    onPanResponderRelease: () => {
      // Soltar el dedo
      if (draggingTask && dragOverDay) {
        // Si soltamos sobre un día válido, llamar al drop
        handleDayDrop(dragOverDay);
      } else {
        // Si no, cancelar
        finishDrag();
      }
    },
  });
  // ✅ --- FIN ARREGLO 'DROP' ---


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

  const getCurrentMonthName = () =>
    currentStartDate.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });

  const tasksForSelectedDate = getTasksForSelectedDate();

  const DAY_BG_DEFAULT = isDark ? "#202020" : "#f8f9fa";
  const EMPTY_CARD_BG = isDark ? "#181818" : "#f8f9fa";

  // Renderizar tarea individual (sin cambios)
  const renderTaskItem = (task: Task) => (
    <TouchableOpacity
      key={task.id}
      style={[
        styles.taskItem,
        { backgroundColor: EMPTY_CARD_BG, borderColor: CARD_BORDER },
        draggingTask?.id === task.id && styles.draggingTask,
      ]}
      onLongPress={(evt) => {
        // Iniciar drag
        startDrag(task, evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      }}
      delayLongPress={300} // Reducimos un poco el delay
      onPress={() => handleTaskPress(task)}
      disabled={isDragging} // Deshabilitar click mientras se arrastra
    >
      <View style={styles.dragHandle}>
        <Ionicons name="reorder-three-outline" size={20} color={SUBTEXT} />
      </View>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, { color: TEXT }]} numberOfLines={1}>
          {task.title}
        </Text>
        <Text
          style={[styles.taskDescription, { color: SUBTEXT }]}
          numberOfLines={2}
        >
          {task.description || "Sin descripción"}
        </Text>
        <View style={styles.taskMeta}>
          {task.priority && (
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
          )}
          <Text style={[styles.taskStatus, { color: SUBTEXT }]}>
            {task.status || "Pendiente"}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={SUBTEXT} />
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: CARD_BG, borderColor: CARD_BORDER, borderWidth: 1 },
      ]}
      {...panResponder.panHandlers} // Aplicar el PanResponder a todo el calendario
    >
      {/* Header con navegación (sin cambios) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={[
            styles.navButton,
            {
              backgroundColor: INPUT_BG,
              borderColor: INPUT_BORDER,
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <View style={styles.dateInfo}>
          <Text style={[styles.monthText, { color: TEXT }]}>
            {getCurrentMonthName()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={goToNextMonth}
          style={[
            styles.navButton,
            {
              backgroundColor: INPUT_BG,
              borderColor: INPUT_BORDER,
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons name="chevron-forward" size={24} color={TEXT} />
        </TouchableOpacity>
      </View>

      {/* Overlay de tarea arrastrando (sin cambios) */}
      {draggingTask && (
        <View
          style={[
            styles.draggingTaskOverlay,
            {
              top: dragPosition.y - 40,
              left: dragPosition.x - 100,
              backgroundColor: isDark ? "#333" : "#fff",
              borderColor: BRAND,
            },
          ]}
        >
          <View style={styles.draggingTaskPreview}>
            <Ionicons
              name="reorder-three-outline"
              size={20}
              color={SUBTEXT}
            />
            <Text
              style={[styles.taskTitle, { color: TEXT, marginLeft: 8 }]}
              numberOfLines={1}
            >
              {draggingTask.title}
            </Text>
            <Ionicons
              name="move-outline"
              size={20}
              color={BRAND}
              style={{ marginLeft: "auto" }}
            />
          </View>
          <View style={[styles.dropHint, { backgroundColor: BRAND }]}>
            <Text style={styles.dropHintText}>
              {dragOverDay
                ? `Soltar en día ${dragOverDay}`
                : "Arrastra a un día"}
            </Text>
          </View>
        </View>
      )}

      {/* Fecha seleccionada (sin cambios) */}
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

      {/* Indicadores (sin cambios) */}
      <View style={styles.indicators}>
        <View style={styles.indicator}>
          <View style={[styles.indicatorColor, { backgroundColor: BRAND }]} />
          <Text style={[styles.indicatorText, { color: SUBTEXT }]}>
            Con tareas
          </Text>
        </View>
        <View style={styles.indicator}>
          <View style={[styles.indicatorColor, { backgroundColor: "#1a8f2e" }]} />
          <Text style={[styles.indicatorText, { color: SUBTEXT }]}>Hoy</Text>
        </View>
        <View style={styles.indicator}>
          <View style={[styles.indicatorColor, { backgroundColor: "#FF6B6B" }]} />
          <Text style={[styles.indicatorText, { color: SUBTEXT }]}>
            Seleccionado
          </Text>
        </View>
        <View style={styles.indicator}>
          <View
            style={[styles.indicatorColor, { backgroundColor: "#FFA500" }]}
          />
          <Text style={[styles.indicatorText, { color: SUBTEXT }]}>
            Arrastrando
          </Text>
        </View>
      </View>

      {/* ✅ --- INICIO ARREGLO 'DROP': Añadir ref y onLayout --- */}
      <View
        ref={gridRef}
        style={styles.daysGrid}
        onLayout={() => {
          // Medir la posición del grid en la pantalla
          gridRef.current?.measure((x, y, width, height, pageX, pageY) => {
            if (width === 0 && height === 0) return; // Evitar mediciones incorrectas
            setGridLayout({ x: pageX, y: pageY, width, height });
          });
        }}
      >
      {/* ✅ --- FIN ARREGLO 'DROP' --- */}
        {daysInMonth.map((day) => {
          const dayHasTasks = hasTasks(day);
          const dayIsToday = isToday(day);
          const dayIsSelected = isSelected(day);
          const dayIsDragOver = dragOverDay === day;

          let backgroundColor = DAY_BG_DEFAULT;
          let textColor = TEXT;
          let borderWidth = 1;
          let borderColor = "transparent";

          if (dayIsDragOver) {
            backgroundColor = "#FFA500";
            textColor = "#fff";
          } else if (dayIsToday) {
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
                dayIsDragOver && styles.dayButtonDragOver,
              ]}
              // ✅ ARREGLO: Simplificar onPress. El 'drop' se maneja
              // por el PanResponder.onPanResponderRelease
              onPress={() => {
                if (!isDragging) {
                  handleDateSelect(day);
                }
              }}
              // ✅ ARREGLO: Quitar onPressIn y onPressOut
            >
              <Text style={[styles.dayText, { color: textColor }]}>{day}</Text>
              {dayHasTasks &&
                !dayIsToday &&
                !dayIsSelected &&
                !dayIsDragOver && (
                  <View
                    style={[styles.taskDot, { backgroundColor: "#fff" }]}
                  />
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

      {/* Lista de tareas para la fecha seleccionada (sin cambios) */}
      {selectedDate && (
        <View style={[styles.tasksSection, { borderTopColor: CARD_BORDER }]}>
          <View style={styles.tasksHeader}>
            <Text style={[styles.tasksTitle, { color: TEXT }]}>
              Tareas para{" "}
              {selectedDate.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              })}
            </Text>
            <Text style={[styles.tasksCount, { color: SUBTEXT }]}>
              {tasksForSelectedDate.length}{" "}
              {tasksForSelectedDate.length === 1 ? "tarea" : "tareas"}
            </Text>
          </View>

          {tasksForSelectedDate.length > 0 ? (
            <View style={styles.tasksList}>
              {tasksForSelectedDate.map(renderTaskItem)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={SUBTEXT} />
              <Text style={[styles.emptyStateText, { color: SUBTEXT }]}>
                No hay tareas para esta fecha
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: SUBTEXT }]}>
                Mantén presionado una tarea para arrastrarla a otra fecha
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
    gap: DAY_GAP, // Usar constante
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  dayButton: {
    width: DAY_SIZE,  // Usar constante
    height: DAY_SIZE, // Usar constante
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
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tasksTitle: { fontSize: 16, fontWeight: "700" },
  tasksCount: { fontSize: 14, fontWeight: "600" },
  tasksList: {
    // Sin flex: 1
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 4,
    paddingRight: 12,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: { fontSize: 16, marginTop: 12, marginBottom: 4 },
  emptyStateSubtext: { fontSize: 14, textAlign: "center", paddingHorizontal: 20 },

  // Estilos Drag & Drop
  draggingTask: {
    opacity: 0.5,
  },
  dragHandle: {
    marginRight: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  draggingTaskOverlay: {
    position: "absolute",
    zIndex: 1000,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 2,
    width: 200,
  },
  draggingTaskPreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  dropHint: {
    padding: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  dropHintText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  dayButtonDragOver: {
    transform: [{ scale: 1.1 }],
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  dropIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});