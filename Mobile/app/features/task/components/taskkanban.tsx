    import React from "react";
    import { View, Text, ScrollView, StyleSheet } from "react-native";
    import type { Task } from "../types";

    interface Props {
    tasks: Task[];
    }

    export function TaskKanban({ tasks }: Props) {
    const columns = [
        { key: "pending", title: "Pendientes", color: "#E0E0E0" },
        { key: "in_progress", title: "En progreso", color: "#FFF3CD" },
        { key: "completed", title: "Completadas", color: "#D4EDDA" },
    ];

    const getTasksByStatus = (statusKey: string) =>
        tasks.filter((t) => t.status === statusKey);

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.kanbanContainer}>
            {columns.map((col) => {
            const colTasks = getTasksByStatus(col.key);
            return (
                <View key={col.key} style={styles.column}>
                <Text style={[styles.columnTitle, { color: "#3B34FF" }]}>
                    {col.title}
                </Text>

                <ScrollView style={styles.taskList}>
                    {colTasks.length === 0 ? (
                    <Text style={styles.emptyText}>Sin tareas</Text>
                    ) : (
                    colTasks.map((task) => (
                        <View key={task.id} style={[styles.card, { backgroundColor: col.color }]}>
                        <Text style={styles.cardTitle}>{task.title}</Text>
                        {task.description && (
                            <Text style={styles.cardDesc} numberOfLines={2}>
                            {task.description}
                            </Text>
                        )}
                        <Text style={styles.cardMeta}>
                            {task.assignee?.name || "Sin asignar"}
                        </Text>
                        </View>
                    ))
                    )}
                </ScrollView>
                </View>
            );
            })}
        </View>
        </ScrollView>
    );
    }

    const styles = StyleSheet.create({
    kanbanContainer: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    column: {
        width: 260,
        marginRight: 12,
        backgroundColor: "#F8F9FB",
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    columnTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    taskList: {
        maxHeight: 600,
    },
    card: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardTitle: {
        fontWeight: "700",
        fontSize: 14,
        color: "#333",
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 12,
        color: "#555",
        marginBottom: 6,
    },
    cardMeta: {
        fontSize: 11,
        color: "#3B34FF",
        fontWeight: "500",
    },
    emptyText: {
        fontSize: 12,
        color: "#999",
        textAlign: "center",
        fontStyle: "italic",
        marginTop: 8,
    },
    });
