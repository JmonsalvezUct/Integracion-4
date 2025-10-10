    import React from "react";
    import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import type { Task } from "../types";



    interface TaskCalendarProps {
    tasks: Task[];
    currentStartDate: Date;
    setCurrentStartDate: (date: Date) => void;
    }

    export function TaskCalendar({
    tasks,
    currentStartDate,
    setCurrentStartDate,
    }: TaskCalendarProps) {
    const today = new Date();

    const generateTwoWeekDays = () => {
        const days: { date: Date; isToday: boolean; hasTasks: boolean }[] = [];
        for (let i = 0; i < 14; i++) {
        const currentDate = new Date(currentStartDate);
        currentDate.setDate(currentStartDate.getDate() + i);

        const isToday =
            currentDate.getDate() === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();

        const hasTasks = tasks.some((t: Task) => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate);
            return (
            taskDate.getDate() === currentDate.getDate() &&
            taskDate.getMonth() === currentDate.getMonth() &&
            taskDate.getFullYear() === currentDate.getFullYear()
            );
        });

        days.push({ date: currentDate, isToday, hasTasks });
        }
        return days;
    };

    const goToPreviousWeek = () => {
        const newDate = new Date(currentStartDate);
        newDate.setDate(currentStartDate.getDate() - 14);
        setCurrentStartDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentStartDate);
        newDate.setDate(currentStartDate.getDate() + 14);
        setCurrentStartDate(newDate);
    };

    const getDateRangeText = () => {
        const start = currentStartDate;
        const end = new Date(currentStartDate);
        end.setDate(currentStartDate.getDate() + 13);

        const formatDate = (d: Date) =>
        d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });

        return `${formatDate(start)} - ${formatDate(end)}`;
    };

    const getCurrentMonthName = () => {
        const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
        ];
        return months[currentStartDate.getMonth()];
    };

    return (
        <View style={styles.container}>

        <View style={styles.header}>
            <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.dateInfo}>
            <Text style={styles.monthText}>
                {getCurrentMonthName()} {currentStartDate.getFullYear()}
            </Text>
            <Text style={styles.dateRangeText}>{getDateRangeText()}</Text>
            </View>
            <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#333" />
            </TouchableOpacity>
        </View>


        <View style={styles.weekDays}>
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <Text key={d} style={styles.weekDayText}>
                {d}
            </Text>
            ))}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
            {generateTwoWeekDays().map((day, idx) => (
            <TouchableOpacity
                key={idx}
                style={[
                styles.day,
                day.hasTasks && styles.hasTaskDay,
                day.isToday && styles.todayDay,
                ]}
            >
                <Text
                style={[
                    styles.dayText,
                    day.isToday && styles.todayText,
                    day.hasTasks && styles.hasTaskText,
                ]}
                >
                {day.date.getDate()}
                </Text>
            </TouchableOpacity>
            ))}
        </View>


        <View style={styles.legend}>
            <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.todayLegend]} />
            <Text style={styles.legendText}>Hoy</Text>
            </View>
            <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.taskLegend]} />
            <Text style={styles.legendText}>Con tareas</Text>
            </View>
        </View>
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    navButton: { padding: 8 },
    dateInfo: { alignItems: "center" },
    monthText: { fontSize: 18, fontWeight: "bold", color: "#333" },
    dateRangeText: { fontSize: 14, color: "#666" },
    weekDays: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    weekDayText: { fontSize: 12, fontWeight: "600", color: "#666", width: 40, textAlign: "center" },
    grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
    day: {
        width: "14.28%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f0f0f0",
        borderRadius: 8,
        margin: 1,
        backgroundColor: "#fff",
    },
    hasTaskDay: { backgroundColor: "#EFEFFF", borderColor: "#3B34FF" },
    todayDay: { borderColor: "#3B34FF", borderWidth: 2 },
    dayText: { fontSize: 14, color: "#333", fontWeight: "500" },
    todayText: { color: "#3B34FF", fontWeight: "bold" },
    hasTaskText: { color: "#3B34FF", fontWeight: "600" },
    legend: { flexDirection: "row", justifyContent: "center", gap: 20 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendColor: { width: 12, height: 12, borderRadius: 6 },
    todayLegend: { backgroundColor: "#3B34FF" },
    taskLegend: { backgroundColor: "#EFEFFF", borderWidth: 1, borderColor: "#3B34FF" },
    legendText: { fontSize: 12, color: "#666" },
    });
