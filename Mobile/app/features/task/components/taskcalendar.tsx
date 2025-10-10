import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Task } from "../types";

interface TaskCalendarProps {
  tasks: Task[];
  currentStartDate: Date;
  setCurrentStartDate: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void; // CORREGIDO: acepta Date | null
}

export function TaskCalendar({
  tasks,
  currentStartDate,
  setCurrentStartDate,
  selectedDate,
  setSelectedDate,
}: TaskCalendarProps) {
  const today = new Date();

  // DEBUG: Verificar tareas y fechas
  console.log("📊 Total tareas:", tasks.length);
  tasks.forEach(task => {
    if (task.dueDate) {
      console.log(`📅 Tarea "${task.title}": ${new Date(task.dueDate).toLocaleDateString()}`);
    }
  });

  // Generar días del mes actual
  const getDaysInMonth = () => {
    const year = currentStartDate.getFullYear();
    const month = currentStartDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  };

  const daysInMonth = getDaysInMonth();

  // Verificar si un día tiene tareas
  const hasTasks = (day: number) => {
    const date = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), day);
    
    const hasTask = tasks.some(task => {
      if (!task.dueDate) return false;
      
      try {
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      } catch (error) {
        console.log("Error procesando fecha:", task.dueDate);
        return false;
      }
    });

    if (hasTask) {
      console.log(`✅ Día ${day} tiene tareas`);
    }

    return hasTask;
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
    console.log("🗓️ Fecha seleccionada:", newDate.toLocaleDateString());
    setSelectedDate(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentStartDate);
    newDate.setMonth(currentStartDate.getMonth() - 1);
    setCurrentStartDate(newDate);
    setSelectedDate(null); // CORREGIDO: ahora acepta null
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentStartDate);
    newDate.setMonth(currentStartDate.getMonth() + 1);
    setCurrentStartDate(newDate);
    setSelectedDate(null); // CORREGIDO: ahora acepta null
  };

  const getCurrentMonthName = () => {
    return currentStartDate.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header con navegación */}
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

      {/* Fecha seleccionada */}
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

      {/* Indicadores de colores */}
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
      </View>

      {/* Grid de días - SOLO NÚMEROS */}
      <View style={styles.daysGrid}>
        {daysInMonth.map((day) => {
          const dayHasTasks = hasTasks(day);
          const dayIsToday = isToday(day);
          const dayIsSelected = isSelected(day);

          // Determinar colores
          let backgroundColor = "#f8f9fa";
          let textColor = "#666";
          
          if (dayIsToday) {
            backgroundColor = "#1a8f2e"; // VERDE para hoy
            textColor = "white";
          } else if (dayIsSelected) {
            backgroundColor = "#FF6B6B"; // ROJO para seleccionado
            textColor = "white";
          } else if (dayHasTasks) {
            backgroundColor = "#3B34FF"; // AZUL para días con tareas
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
                  borderColor: dayIsToday ? "#1a8f2e" : "transparent"
                }
              ]}
              onPress={() => handleDateSelect(day)}
            >
              <Text style={[styles.dayText, { color: textColor }]}>
                {day}
              </Text>
              
              {/* Puntito para días con tareas que no están seleccionados ni son hoy */}
              {dayHasTasks && !dayIsToday && !dayIsSelected && (
                <View style={styles.taskDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
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
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
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
});